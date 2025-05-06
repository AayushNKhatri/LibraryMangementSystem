using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using server.Dtos;
using server.Database;
using server.Entities;
using server.Services.Interface;
using server.Entities.Enum;

namespace server.Controllers 
{
    [Route("api/Books")]
    [ApiController]

    public class FilterController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public FilterController(ApplicationDbContext db) {
            _db = db;
        }

        // GET Method for filter the books based on language
        [HttpGet("/filter/language/{bookLanguange}")]
        public async Task<IActionResult> FilterBooksByLanguage(BookLanguage language) {
            var filterByLanguage = await _db.Books.Where(b => b.Language == language).ToListAsync();
            if (filterByLanguage == null) return NotFound("Sorry, please select language between Nepali and English");
            return filterByLanguage.Any() ? Ok(filterByLanguage) : NotFound("No Books found for that language");
        }


        // GET Method for filter the books based on status
        [HttpGet("/filter/status/{status}")]
        public async Task<IActionResult> FilterBooksByStatus(Status status) {
            var filterByStatus = await _db.Books.Where(b => b.Status == status).ToListAsync();

            if (!filterByStatus.Any())
                return NotFound("No books found with the specified status.");

            return Ok(filterByStatus);
                }

        // GET Method for filter the books based on category
        [HttpGet("/filter/category/{category}")]
        public async Task<IActionResult> FilterBooksByCategory(Category Category) {
            var filterByCategory = await _db.BookFilters.Where(b => b.Category == Category).ToListAsync();
            if (filterByCategory == null) return NotFound("Sorry, we don't have that category");
            return filterByCategory.Any() ? Ok(filterByCategory) : NotFound("No we don't have that category");
        }

        // GET Method for filter the books based on genre
        [HttpGet("/filter/genre/{genre}")]
        public async Task<IActionResult> FilterBooksByGenre(Genre Genre) {
            var filterByGenre = await _db.BookFilters.Where(b => b.Genre == Genre).ToListAsync();
            if(filterByGenre == null) return NotFound("Sorry, we do not contain that genre right now");
            return filterByGenre.Any() ? Ok(filterByGenre) : NotFound("No we don't have that category");
        }

        //GET Method for filter the books based on formats
        [HttpGet("/filter/filter/{format}")]
        public async Task<IActionResult> FilterBooksByFormat(Format format) {
            var filterByFormat = await _db.BookFilters.Where(b => b.Format == format).ToListAsync();
            if(filterByFormat == null) return NotFound("Sorry, we don't own that format of book");
            return filterByFormat.Any() ? Ok(filterByFormat) : NotFound("No we don't have that format of book");
        }

        //The following filter endpoints are for order specific
    }
}