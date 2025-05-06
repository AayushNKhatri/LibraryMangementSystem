using server.Services.Interface;
using server.Entities;
using server.Database;
using Microsoft.EntityFrameworkCore;

namespace server.Services
{
    public class BookService : IBookInterface
    {
        private readonly ApplicationDbContext _context;

        public BookService(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task AddBooks(Book book, BookFilters bookFilters, BookInventory bookInventory)
        {
            try
            {
                await _context.Books.AddAsync(book);
                await _context.BookFilters.AddAsync(bookFilters);
                await _context.BookInventories.AddAsync(bookInventory);
                await _context.SaveChangesAsync();
            }
            catch(Exception ex)
            {
                throw new Exception("Book is not added" + ex.Message);
            }
        }
        public async Task<List<Book>> GetBooks()
        {
            var books = await _context.Books.Include(b => b.Inventories).Include(f => f.Filters).ToListAsync();
            return books;
        }
    }
}
