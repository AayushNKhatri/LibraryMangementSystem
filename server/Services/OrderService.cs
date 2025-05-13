using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
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
        private readonly INotificationService _notificationService;
        private readonly IEmailSender _emailSender;


        public OrderService(UserManager<User> userManager, ILogger<OrderService> logger, ApplicationDbContext context, IEmailSender emailSender, INotificationService notificationService)
        {
            _userManager = userManager;
            _logger = logger;
            _context = context;
            _notificationService = notificationService;
            _emailSender = emailSender;
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

                // Send notification that item quantity was updated

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

            // Send notification that item was added to cart

            return new CreateCartDto
            {
                Count = newCartItem.Count
            };
        }
        public async Task<List<Cart>> GetCart(string userId)
        {
            var userCart = await _context.Carts.Where(u=>u.UserId == userId).Include(u=> u.User).Include(b=>b.Book).ToListAsync();
            // Return the cart items even if the list is empty
            return userCart;
        }
        public async Task<List<Order>> GetOrder()
        {
            var orderFromDb = await _context.Orders.ToListAsync();
            if(orderFromDb == null) throw new Exception("Orders not found");
            return orderFromDb;
        }
        public async Task<List<Order>> GetOrderById(string userId)
        {
            var orderFromDb = await _context.Orders.Where(o=>o.UserId == userId).OrderByDescending(o=>o.OrderDate).Take(5).ToListAsync();
            if(orderFromDb == null) throw new Exception("Orders not found");
            return orderFromDb;
        }
        public async Task<Order> OrderConformation(string userId)
        {
            var cartItems = await _context.Carts.Where(u=>u.UserId == userId).Include(u=>u.User).Include(u =>u.Book).ToListAsync();
            if(!cartItems.Any()) throw new Exception("No items to make order");
            if(cartItems.Any(b => b.Book==null || b.User == null)) throw new Exception ("The cart is missing valid user or book");
            
            var discount = await CalculateDiscount(userId, cartItems);
            var originalTotal = cartItems.Sum(c => c.Count * Convert.ToDecimal(c.Book?.Price ?? 0));
            var discountedTotal = originalTotal * (1 - discount);

            
            var order = new Order
            {
                OrderId = Guid.NewGuid(),
                UserId = userId,
                OrderDate = DateTime.UtcNow,
                BookCount = cartItems.Sum(c => c.Count),
                TotalAmount = cartItems.Sum(c=>c.Count * (c.Book?.Price??0)),
                OrderStatus = OrderStatus.Pending,
                DiscountApplied = (int)discount*100,
            };
            await _context.Orders.AddAsync(order);
            var OrderDetails = cartItems.Select(item => new OrderDetails{
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

            // Send order confirmation notification
            await _notificationService.CreateNotification(
                userId, 
                $"Your order #{order.OrderId.ToString().Substring(0, 8)} has been confirmed and is now {order.OrderStatus}");

            return order;
        }
        public async Task<bool> AddCartItem(string userId, Guid bookId)
        {
            var cartItems = await _context.Carts.FirstOrDefaultAsync(u=> u.UserId == userId && u.BookId == bookId);
            if(cartItems == null) throw new Exception("Cart item not found");
            cartItems.Count += 1;
            await _context.SaveChangesAsync();

            // Get book title for the notification
            var book = await _context.Books.FirstOrDefaultAsync(b => b.BookId == bookId);
            var bookTitle = book?.Title ?? "Selected book";

            return true;


        }
        public async Task<bool> DecreaseCartItem(string userId, Guid bookId )
        {
            var cartItem = await _context.Carts.FirstOrDefaultAsync(u=>u.BookId == bookId && u.UserId == userId);
            if(cartItem == null) throw new Exception("Cart item not found");
            
            // Get book title for the notification
            var book = await _context.Books.FirstOrDefaultAsync(b => b.BookId == bookId);
            var bookTitle = book?.Title ?? "Selected book";

            if(cartItem.Count <=1)
            {
                _context.Carts.Remove(cartItem);
                await _context.SaveChangesAsync();
                
                return true;
            }
            
            cartItem.Count -= 1;
            await _context.SaveChangesAsync();
            
            
            return true;
        }
        public async Task<bool> RemoveCartItem(string userId,Guid bookId)
        {
            var cartItem = await _context.Carts.FirstOrDefaultAsync(u=>u.UserId == userId && u.BookId == bookId);
            if(cartItem == null) throw new Exception("Cart item not found");
            
            // Get book title for the notification
            var book = await _context.Books.FirstOrDefaultAsync(b => b.BookId == bookId);
            var bookTitle = book?.Title ?? "Selected book";
            
            _context.Carts.Remove(cartItem);
            await _context.SaveChangesAsync();
            
            return true;
        }
        
        public async Task<bool> StacableOrderCount(string userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u=>u.Id == userId);
            var orderComplete = await _context.Orders.AnyAsync(u=>u.UserId == userId && u.OrderStatus == OrderStatus.Pending);
            if(user == null) throw new Exception("User not found");
            if(orderComplete == null) throw new Exception ("Order not found");
            
            var oldCount = user.succesfullOrderCount;
            user.succesfullOrderCount = (user.succesfullOrderCount < 10) ? user.succesfullOrderCount + 1 : 0;
            await _context.SaveChangesAsync();
            
            // Check if user reached 10 successful orders for reward
            // if (oldCount == 9 && user.succesfullOrderCount == 10) {
            //     await _notificationService.CreateNotification(
            //         userId, 
            //         "Congratulations! You've completed 10 orders and earned a loyalty reward!");
            // }
            
            return true;
        }
        public async Task<bool> SendEmail(string userId, Guid orderId)
        {
            string emailMessage = "";
            var user = await _context.Users.FirstOrDefaultAsync(u=>u.Id == userId );
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.OrderId == orderId);
            if(user == null) throw new Exception("User not found");
            if(order == null) throw new Exception("Orders not found");
            switch(order.OrderStatus)
            {
                case OrderStatus.Pending:
                    emailMessage = $@"
                                        <h2>Hi {user.FirstName},</h2>
                                        <p>Your order is *Pending*. We'll notify you when it's updated.</p>";

                    await _emailSender.SendEmailAsync(user.Email, "Your order has been made", emailMessage);
                    break;

                case OrderStatus.Completed:
                    emailMessage = $@"
                                        <h2>Hi {user.FirstName},</h2>
                                        <p>Your order is **completed**. Thank you for shopping with us!</p>";

                    await _emailSender.SendEmailAsync(user.Email, "Your order has been made", emailMessage);
                    break;

                case OrderStatus.Cancelled:
                    emailMessage = $@"<h2>Hi {user.FirstName},</h2>
                                        <p>Unfortunately, your order has been **cancelled**</p>";

                    await _emailSender.SendEmailAsync(user.Email, "Your order has been cancelled", emailMessage);
                    break;
            }
            return true;

        }
        public async Task<bool> ManageOrdersComplete(Guid orderId, string userId, Guid claimsCode)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u=> u.Id == userId);
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.OrderId == orderId);
            if(order == null) throw new Exception("Order not found");
            if(order.ClaimsCode == claimsCode)
            {
                order.OrderStatus = OrderStatus.Completed;
                _context.Orders.Update(order);
                await _context.SaveChangesAsync();
                await SendEmail(userId, orderId);
            }
            return true;
        }
        public async Task<bool> ManageOrdersCancelled(Guid orderId, string userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u=> u.Id == userId);
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.OrderId == orderId);
            if(order == null) throw new Exception("Order not found");
            if(order.OrderStatus == OrderStatus.Pending)
            {
                order.OrderStatus = OrderStatus.Cancelled;
                _context.Orders.Update(order);
                await _context.SaveChangesAsync();
                await SendEmail(userId, orderId);
            }
            return true;
        }

            //This was doen by BERNARD 
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

