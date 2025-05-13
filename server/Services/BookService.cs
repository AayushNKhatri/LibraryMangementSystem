using server.Services.Interface;
using server.Entities;
using server.Database;
using Microsoft.EntityFrameworkCore;
using server.Dtos;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;

namespace server.Services
{
    public class BookService(IImageService _imageservice, ApplicationDbContext _context, IHttpContextAccessor _httpContextAccessor) : IBookInterface
    {
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
            var baseUrl = $"{_httpContextAccessor.HttpContext.Request.Scheme}://{_httpContextAccessor.HttpContext.Request.Host}/uploads/";
            var books = await _context.Books.Include(b => b.Inventories).Include(f => f.Filters).ToListAsync();
                foreach (var book in books)
                {
                    if (!string.IsNullOrEmpty(book.Image))
                    {
                        book.Image = baseUrl + book.Image; // e.g., uploads/books/...
                    }
                }

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
                var baseUrl = $"{_httpContextAccessor.HttpContext.Request.Scheme}://{_httpContextAccessor.HttpContext.Request.Host}/uploads/";
                var book = await _context.Books.Include(b => b.Filters).Include(i => i.Inventories).ToListAsync();
                foreach (var books in book)
                {
                    if (!string.IsNullOrEmpty(books.Image))
                    {
                        books.Image = baseUrl + books.Image; // e.g., uploads/books/...
                    }
                }
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
                    AuthorNamePrimary = updateBookDto.AuthorName1,
                    AuthorNameSecondary = updateBookDto.AuthorName2,
                    AdditionalAuthorName = updateBookDto.AuthorName3,
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

        public async Task<bool> AddImage(Guid bookId, IFormFile image)
        {
            try{
                var stingBookID = bookId.ToString();
                var folderPath = $"books";
                var imagepath = await _imageservice.SaveFile("wwwroot/uploads", folderPath, image, stingBookID);
                var book = _context.Books.FirstOrDefault(x => x.BookId == bookId) ?? throw new Exception("No book Found");
                book.Image = imagepath;
                _context.Books.Update(book);
                await _context.SaveChangesAsync();
                return true;
            }
            catch(Exception e){
                throw new Exception("Error" + e.Message);
            }
        }

        public async Task<bool> UpdateImage(Guid bookId, IFormFile image)
        {
            try{
                var book = _context.Books.FirstOrDefault(x => x.BookId == bookId) ?? throw new Exception("No book Found");
                var folderPath = $"books";
                var stingBookID = bookId.ToString();

                book.Image = await _imageservice.SaveFile("wwwroot/uploads", folderPath, image, stingBookID, string.IsNullOrEmpty(book.Image) ? null : book.Image);
                _context.Books.Update(book);
                await _context.SaveChangesAsync();
                return true;
            }
            catch(Exception e){
                throw new Exception("Error" + e.Message);
            }
        }
    }

}
