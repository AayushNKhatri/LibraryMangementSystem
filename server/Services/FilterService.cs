using Microsoft.EntityFrameworkCore;
using server.Database;
using server.Entities;
using server.Entities.Enum;
using server.Services.Interface;

namespace server.Services
{
    public class FilterService : IFilterService
    {
        private readonly ApplicationDbContext _db;

        public FilterService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<List<Book>> FilterByLanguageAsync(BookLanguage language)
        {
            return await _db.Books.Where(b => b.Language == language).ToListAsync();
        }

        public async Task<List<Book>> FilterByStatusAsync(Status status)
        {
            return await _db.Books.Where(b => b.Status == status).ToListAsync();
        }

        public async Task<List<BookFilters>> FilterByCategoryAsync(Category category)
        {
            return await _db.BookFilters.Where(b => b.Category == category).ToListAsync();
        }

        public async Task<List<BookFilters>> FilterByGenreAsync(Genre genre)
        {
            return await _db.BookFilters.Where(b => b.Genre == genre).ToListAsync();
        }

        public async Task<List<BookFilters>> FilterByFormatAsync(Format format)
        {
            return await _db.BookFilters.Where(b => b.Format == format).ToListAsync();
        }
        
        public async Task<List<Author>> FilterByAuthorAsync()
        {
            return await _db.Authors.ToListAsync();
        }

        public async Task<List<Book>> FilterByNewArrivalAsync(DateTime arrivalDate)
        {
            return await _db.Books.Where(b => b.PublicationDate == arrivalDate).ToListAsync();
        }

        public async Task<List<BookFilters>> FilterByCollectorsAsync() 
        {
            return await _db.BookFilters.Where(b => b.Format == Format.Collectors).ToListAsync();
        }

        public async Task<List<BookFilters>> FilterByPaperbacksAsync()
        {
            return await _db.BookFilters.Where(b => b.Format == Format.Paperback).ToListAsync();
        }

        public async Task<List<BookFilters>> FilterByFantasyAsync()
        {
            return await _db.BookFilters.Where(b => b.Genre == Genre.Fantasy).ToListAsync();
        }

        public async Task<List<BookFilters>> FilterByAdventureAsync()
        {
            return await _db.BookFilters.Where(b => b.Genre == Genre.Adventure).ToListAsync();
        }

        public async Task<List<BookFilters>> FilterByScienceAsync()
        {
            return await _db.BookFilters.Where(b => b.Category == Category.Science).ToListAsync();
        }

        public async Task<List<BookFilters>> FilterByFictionAsync()
        {
            return await _db.BookFilters.Where(b => b.Category == Category.Fiction).ToListAsync();
        }

        public async Task<List<BookFilters>> FilterByNonFictionAsync()
        {
            return await _db.BookFilters.Where(b => b.Category == Category.Nonfiction).ToListAsync();
        }
    }
}
