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
            
            if (filterByLanguage == null) return NotFound("Sorry, we miss the language you are asking for");

            return Ok(filterByLanguage);
        }


        // GET Method for filter the books based on status
        [HttpGet("/filter/status/{status}")]
        public async Task<IActionResult> FilterBooksByStatus(Status status) {
            var filterByStatus = _db.Books.Where(b => b.Status == status).ToListAsync();

            if (filterByStatus == null) return NotFound("Sorry, please input valid statuses");

            return Ok(filterByStatus);
        }

        // GET Method for filter the books based on category
        [HttpGet("/filter/category/{category}")]
        public async Task<IActionResult> FilterBooksByCategory(Category Category) {
            var filterByCategory = await _db.BookFilters.Where(b => b.Category == Category).ToListAsync();

            if (filterByCategory == null) return NotFound("Sorry, we don't have that category");

            return Ok(filterByCategory);
        }

        // GET Method for filter the books based on genre
        [HttpGet("/filter/genre/{genre}")]
        public async Task<IActionResult> FilterBooksByGenre(Genre Genre) {
            var filterByGenre = await _db.BookFilters.Where(b => b.Genre == Genre).ToListAsync();
            if(filterByGenre == null) return NotFound("Sorry, we do not contain that genre right now");
            return Ok(filterByGenre);
        }

        //GET Method for filter the books based on formats
        [HttpGet("/filter/filter/{format}")]
        public async Task<IActionResult> FilterBooksByFormat(Format format) {
            var filterByFormat = await _db.BookFilters.Where(b => b.Format == format).ToListAsync();
            if(filterByFormat == null) return NotFound("Sorry, we don't own that format of book");
            return Ok(filterByFormat);
        }
    }
}