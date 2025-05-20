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

            var book = await _context.Books.Include(b => b.Inventories).FirstOrDefaultAsync(b => b.BookId == bookId);

            if (book == null)
                throw new KeyNotFoundException("Book not found.");

            // Check if book has inventory and sufficient stock
            var inventory = book.Inventories?.FirstOrDefault();
            if (inventory == null)
                throw new Exception("Book inventory not found.");

            if (inventory.Quantity < createCart.Count)
                throw new Exception($"Not enough stock available. Only {inventory.Quantity} items left.");

            var existingCartItem = await _context.Carts.FirstOrDefaultAsync(
                c => c.UserId == user.Id && c.BookId == book.BookId);

            if (existingCartItem != null)
            {
                // Check if there's enough stock for the increased quantity
                if (inventory.Quantity < existingCartItem.Count + createCart.Count)
                    throw new Exception($"Not enough stock available. Only {inventory.Quantity} items left, and you already have {existingCartItem.Count} in your cart.");

                existingCartItem.Count += createCart.Count;
                await _context.SaveChangesAsync();

                // Send notification that item quantity was updated
                await _notificationService.CreateNotification(
                    userId,
                    $"Added {createCart.Count} more of '{book.Title}' to your cart. Total: {existingCartItem.Count}");

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
            await _notificationService.CreateNotification(
                userId,
                $"Added '{book.Title}' to your cart.");

            return new CreateCartDto
            {
                Count = newCartItem.Count
            };
        }
        public async Task<List<Cart>> GetCart(string userId)
        {
            var userCart = await _context.Carts.Where(u=>u.UserId == userId).Include(u=> u.User).Include(b=>b.Book).ThenInclude(b=>b.Inventories).ToListAsync();
            // Return the cart items even if the list is empty
            return userCart;
        }
        public async Task<List<Order>> GetOrder()
        {
            var orderFromDb = await _context.Orders.Include(x => x.User).ToListAsync();
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

            // Validate stock availability for all items in the cart
            foreach (var item in cartItems)
            {
                // Get the book inventory
                var bookInventory = await _context.BookInventories
                    .FirstOrDefaultAsync(bi => bi.BookId == item.BookId);

                if (bookInventory == null)
                    throw new Exception($"Inventory not found for book {item.Book?.Title ?? "Unknown"}");

                // Check if there's enough stock
                if (bookInventory.Quantity < item.Count)
                    throw new Exception($"Not enough stock for book {item.Book?.Title ?? "Unknown"}. Available: {bookInventory.Quantity}, Requested: {item.Count}");
            }

            // Get all book inventories for the cart items in one query
            var bookIds = cartItems.Select(c => c.BookId).ToList();
            var bookInventories = await _context.BookInventories
                .Where(bi => bookIds.Contains(bi.BookId))
                .ToDictionaryAsync(bi => bi.BookId, bi => bi);

            var discount = await CalculateDiscount(userId, cartItems);

            // Calculate totals using prices from BookInventories
            decimal originalTotal = 0;
            foreach (var item in cartItems)
            {
                if (bookInventories.TryGetValue(item.BookId, out var inventory))
                {
                    decimal effectivePrice = inventory.IsOnSale
                        ? (decimal)(inventory.Price * (1 - inventory.DiscountPercent / 100.0))
                        : (decimal)inventory.Price;

                    originalTotal += item.Count * effectivePrice;
                }
            }

            var discountedTotal = originalTotal * (1 - discount);

            var order = new Order
            {
                OrderId = Guid.NewGuid(),
                UserId = userId,
                OrderDate = DateTime.UtcNow,
                BookCount = cartItems.Sum(c => c.Count),
                TotalAmount = (double)discountedTotal,
                OrderStatus = OrderStatus.Pending,
                DiscountApplied = (int)discount*100,
                ClaimsCode = Guid.NewGuid()
            };
            await _context.Orders.AddAsync(order);

            var OrderDetails = new List<OrderDetails>();

            foreach (var item in cartItems)
            {
                if (bookInventories.TryGetValue(item.BookId, out var inventory))
                {
                    decimal effectivePrice = inventory.IsOnSale
                        ? (decimal)(inventory.Price * (1 - inventory.DiscountPercent / 100.0))
                        : (decimal)inventory.Price;

                    OrderDetails.Add(new OrderDetails
                    {
                        OrderDetailsId = Guid.NewGuid(),
                        OrderId = order.OrderId,
                        BookId = item.BookId,
                        OrderQuantity = item.Count,
                        Price = (double)effectivePrice
                    });
                }
            }
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
            var cartItem = await _context.Carts.FirstOrDefaultAsync(u => u.UserId == userId && u.BookId == bookId);
            if(cartItem == null) throw new Exception("Cart item not found");

            // Get book with inventory to check stock
            var book = await _context.Books.Include(b => b.Inventories).FirstOrDefaultAsync(b => b.BookId == bookId);
            if (book == null) throw new Exception("Book not found");

            var inventory = book.Inventories?.FirstOrDefault();
            if (inventory == null) throw new Exception("Book inventory not found");

            // Check if there's enough stock for the increased quantity
            if (inventory.Quantity <= cartItem.Count)
                throw new Exception($"Cannot add more items. Only {inventory.Quantity} in stock, and you already have {cartItem.Count} in your cart.");

            cartItem.Count += 1;
            await _context.SaveChangesAsync();

            // Send notification about the update
            await _notificationService.CreateNotification(
                userId,
                $"Added one more '{book.Title}' to your cart. Total: {cartItem.Count}");

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

                var orderDetails = await _context.OrderDetails
                    .Where(od => od.OrderId == orderId)
                    .ToListAsync();

                if (orderDetails == null || !orderDetails.Any())
                    throw new Exception("Order details not found");

                foreach (var detail in orderDetails)
                {
                    var bookInventory = await _context.BookInventories
                        .FirstOrDefaultAsync(bi => bi.BookId == detail.BookId);

                    if (bookInventory == null)
                        continue;

                    bookInventory.Quantity = Math.Max(0, bookInventory.Quantity - detail.OrderQuantity);

                    _context.BookInventories.Update(bookInventory);

                    _logger.LogInformation($"Decreased stock for book {detail.BookId} by {detail.OrderQuantity}. New stock: {bookInventory.Quantity}");
                }

                order.OrderStatus = OrderStatus.Completed;
                _context.Orders.Update(order);
                await _context.SaveChangesAsync();

                await SendEmail(userId, orderId);

                await _notificationService.CreateNotification(
                    userId,
                    $"Your order #{order.OrderId.ToString().Substring(0, 8)} has been completed and is ready for pickup.");
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

        public async Task<decimal> CalculateDiscount(string userId, List<Cart> cartItems)
        {
            if (cartItems == null || !cartItems.Any())
                return 0m;
            var userCount = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (userCount == null)
                throw new Exception("User not found");
        
            decimal discount = 0;

            if (userCount.succesfullOrderCount == 5)
                discount += 0.05m; // 5% discount

            if (userCount.succesfullOrderCount == 10)
                discount += 0.10m; // Additional 10% discount

            return discount;
        }
    }
}
