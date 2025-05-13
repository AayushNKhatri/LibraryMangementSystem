using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using server.Database;
using server.Dtos;
using server.Entities;
using server.Entities.Enum;
using server.Services.Interface;

namespace server.Services
{

    public class OrderService : IOrederInterface
    {
        private readonly UserManager<User> _userManager;
        private readonly ILogger<OrderService> _logger;
        private readonly ApplicationDbContext _context;

        public OrderService(UserManager<User> userManager, ILogger<OrderService> logger, ApplicationDbContext context)
        {
            _userManager = userManager;
            _logger = logger;
            _context = context;
        }
        public async Task<CreateCartDto> CreateCart(string userId, Guid bookId, CreateCartDto createCart)
        {
            if (createCart.Count <= 0)
                throw new ArgumentException("Count must be greater than 0.");

            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                throw new KeyNotFoundException("User not found.");

            var book = await _context.Books.FirstOrDefaultAsync(b => b.BookId == bookId);

            if (book == null)
                throw new KeyNotFoundException("Book not found.");

            var existingCartItem = await _context.Carts.FirstOrDefaultAsync(
                c => c.UserId == user.Id && c.BookId == book.BookId);

            if (existingCartItem != null)
            {
                existingCartItem.Count += createCart.Count;
                await _context.SaveChangesAsync();

                return new CreateCartDto
                {
                    Count = existingCartItem.Count
                };
            }

            var newCartItem = new Cart
            {
                CartId = Guid.NewGuid(),
                UserId = user.Id,
                BookId = book.BookId,
                Count = createCart.Count
            };

            _context.Carts.Add(newCartItem);
            await _context.SaveChangesAsync();

            return new CreateCartDto
            {
                Count = newCartItem.Count
            };
        }
        public async Task<List<GetCartDto>> GetCart(string userId)
        {
            var userCart = await _context.Carts.Where(u => u.UserId == userId).ToListAsync();
            if (!userCart.Any())
            {
                throw new Exception("User cart is empty");
            }
            var result = userCart.Select(cart => new GetCartDto
            {
                UserId = cart.UserId,
                BookId = cart.BookId,
                Count = cart.Count
            }).ToList();
            return result;
        }
        public async Task<List<GetOrderSummaryDto>> OrderSummary(string userId)
        {
            var ordersFromUser = await _context.Carts.Where(u => u.UserId == userId).Include(u => u.User).Include(b => b.Book).ToListAsync();
            if (!ordersFromUser.Any()) throw new Exception("There is no orders to show");
            var result = ordersFromUser.Select(cart => new GetOrderSummaryDto
            {
                FirstName = cart.User.FirstName,
                LastName = cart.User.LastName,
                City = cart.User.City,
                Street = cart.User.Street,
                Contact = cart.User.Contact,
                Quantity = cart.Count,
                Price = cart.Book.Price,
                TotalAmount = cart.Count * cart.Book.Price,
                DiscountApplied = 0
            }).ToList();
            if (!result.Any()) throw new Exception("Nothing to display for order summary");
            return result;
        }
        public async Task<Order> OrderConformation(string userId)
        {
            var cartItems = await _context.Carts.Where(u => u.UserId == userId).Include(u => u.User).Include(u => u.Book).ToListAsync();
            if (!cartItems.Any()) throw new Exception("No items to make order");
            if (cartItems.Any(b => b.Book == null || b.User == null)) throw new Exception("The cart is missing valid user or book");

            //Calculate Discount

            var discount = await CalculateDiscount(userId, cartItems);
            var originalTotal = cartItems.Sum(c => c.Count * Convert.ToDecimal(c.Book?.Price ?? 0));
            var discountedTotal = originalTotal * (1 - discount);


            var order = new Order
            {
                OrderId = Guid.NewGuid(),
                UserId = userId,
                OrderDate = DateTime.UtcNow,
                BookCount = cartItems.Sum(c => c.Count),
                TotalAmount = (double)discountedTotal,
                OrderStatus = OrderStatus.Pending,
                DiscountApplied = (int)discount * 100
            };
            await _context.Orders.AddAsync(order);
            var OrderDetails = cartItems.Select(item => new OrderDetails
            {
                OrderDetailsId = Guid.NewGuid(),
                OrderId = order.OrderId,
                BookId = item.BookId,
                OrderQuantity = item.Count,
                Price = item.Book?.Price ?? 0
            }).ToList();
            await _context.OrderDetails.AddRangeAsync(OrderDetails);
            //remove cart items
            _context.Carts.RemoveRange(cartItems);
            await _context.SaveChangesAsync();
            return order;
        }
        public async Task<bool> AddCartItem(string userId, Guid bookId)
        {
            var cartItems = await _context.Carts.FirstOrDefaultAsync(u => u.UserId == userId && u.BookId == bookId);
            if (cartItems == null) throw new Exception("Cart item not found");
            cartItems.Count += 1;
            await _context.SaveChangesAsync();
            return true;


        }
        public async Task<bool> DecreaseCartItem(string userId, Guid bookId)
        {
            var cartItem = await _context.Carts.FirstOrDefaultAsync(u => u.BookId == bookId && u.UserId == userId);
            if (cartItem == null) throw new Exception("Cart item not found");
            if (cartItem.Count <= 1)
            {
                _context.Carts.Remove(cartItem);
            }
            cartItem.Count -= 1;
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<bool> RemoveCartItem(string userId, Guid bookId)
        {
            var cartItem = await _context.Carts.FirstOrDefaultAsync(u => u.UserId == userId && u.BookId == bookId);
            if (cartItem == null) throw new Exception("Cart item not found");
            _context.Carts.Remove(cartItem);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<decimal> CalculateDiscount(string userId, List<Cart> cartItems)
        {
            if (cartItems == null || !cartItems.Any())
                return 0m;

            int totalBooks = cartItems.Sum(c => c.Count);
            int pastOrderCount = await _context.Orders.CountAsync(o => o.UserId == userId && o.OrderStatus == OrderStatus.Completed);

            decimal discount = 0;

            if (totalBooks >= 5)
                discount += 0.05m; // 5% discount

            if (pastOrderCount >= 10)
                discount += 0.10m; // Additional 10% discount

            return discount;
        }


    }
}