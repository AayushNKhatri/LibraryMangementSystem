using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using server.Database;
using server.Dtos;
using server.Entities;
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
                    BookId = existingCartItem.BookId,
                    UserId = existingCartItem.UserId,
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
                BookId = newCartItem.BookId,
                UserId = newCartItem.UserId,
                Count = newCartItem.Count
            };
        }

        public Task OrderSummary()
        {
            throw new NotImplementedException();
        }
            public Task OrderConformation()
        {
            throw new NotImplementedException();
        }
        public Task Add(Guid cartId)
        {
            throw new NotImplementedException();
        }
        public Task Minus(Guid cartId)
        {
            throw new NotImplementedException();
        }
        public Task Remove(Guid cartId)
        {
            throw new NotImplementedException();
        }
    }
}