using server.Services.Interface;
using server.Entities;
using server.Database;
using Microsoft.EntityFrameworkCore;
using server.Dtos;
using Microsoft.AspNetCore.Authorization;

namespace server.Services
{
    public class BookService : IBookInterface
    {
        private readonly ApplicationDbContext _context;

        public BookService(ApplicationDbContext context)
        {
            _context = context;
        }
        [Authorize(Roles = "Admin")]
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

        public async Task DeleteBook(Guid bookID)
        {
            try
            {
                var books = await _context.Books.FirstOrDefaultAsync(b => b.BookId == bookID);
                var bookFilter = await _context.BookFilters.FirstOrDefaultAsync(b => b.BookId == bookID);
                var bookInventory = await _context.BookInventories.FirstOrDefaultAsync(b => b.BookId == bookID);
                if (books == null)
                {
                    throw new Exception("Books not found");
                }
                _context.Books.Remove(books);
                _context.BookFilters.Remove(bookFilter);
                _context.BookInventories.Remove(bookInventory);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("Error deleting book" + ex.Message);
            }
        }

        public async Task<List<Book>> GetById(Guid bookID)
        {
            try
            {
                var book = await _context.Books.Include(b => b.Filters).Include(i => i.Inventories).ToListAsync();
                return book;
            }
            catch (Exception ex)
            {
                throw new Exception(("Error getting book by Book ID" + ex.Message));
            }
        }

        public async Task UpdateBook(Guid bookID, UpdateBookDto updateBookDto)
        {
            try
            {
                var bookUpdate = await _context.Books.FirstOrDefaultAsync(b=>b.BookId == bookID);
                var bookFilterUpdate = await _context.BookFilters.FirstOrDefaultAsync(b=>b.BookId == bookID);
                var bookInventoryUpdate = await _context.BookInventories.FirstOrDefaultAsync(b => b.BookId == bookID);
                var bookModel = new
                {
                    Title = updateBookDto.Title,
                    ISBN = updateBookDto.ISBN,
                    Description = updateBookDto.Description,
                    Publisher = updateBookDto.Publisher,
                    Language = updateBookDto.Language,
                    Price = updateBookDto.Price,
                    PublicationDate = updateBookDto.PublicationDate,
                    Status = updateBookDto.Status
                };
                var filterUpdateModel = new
                {
                    Category = updateBookDto.Category,
                    Genre = updateBookDto.Genre,
                    Format = updateBookDto.Format
                };
                var inventoryUpdateModel = new
                {
                    Quantity = updateBookDto.Quantity,
                    Price = updateBookDto.Price,
                    IsOnSale = updateBookDto.IsOnSale,
                    DiscountPercent = updateBookDto.DiscountPercent,
                    DiscoundStartDate = updateBookDto.DiscoundStartDate,
                    DiscoundEndDate = updateBookDto.DiscoundEndDate
                };
                if (bookUpdate == null)
                    throw new Exception("Book not found");

                _context.Entry(bookUpdate).CurrentValues.SetValues(bookModel);
                _context.Entry(bookFilterUpdate).CurrentValues.SetValues(filterUpdateModel);
                _context.Entry(bookInventoryUpdate).CurrentValues.SetValues(inventoryUpdateModel);

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("Book not updated" + ex.Message);
            }
        }
    }

}
