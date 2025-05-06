using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
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

        [HttpGet("/filter/{bookLanguange}")]
        public IActionResult FilterBooksByLanguage(BookLanguage language) {
            var filterByLanguage = _db.Books.Where(b => b.Language == language);
            
            if (filterByLanguage == null) return NotFound("Sorry, we miss the language you are asking for");

            return Ok(filterByLanguage);
        }
    }
}