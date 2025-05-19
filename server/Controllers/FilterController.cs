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
        private readonly IFilterService _filterService;

        public FilterController(IFilterService filterService)
        {
            _filterService = filterService;
        }

        [HttpGet("/filter/language/{language}")]
        public async Task<IActionResult> FilterBooksByLanguage(BookLanguage language)
        {
            var books = await _filterService.FilterByLanguageAsync(language);
            return Ok(books);
        }

        [HttpGet("/filter/status/{status}")]
        public async Task<IActionResult> FilterBooksByStatus(Status status)
        {
            var books = await _filterService.FilterByStatusAsync(status);
            return Ok(books);
        }

        [HttpGet("/filter/category/{category}")]
        public async Task<IActionResult> FilterBooksByCategory(Category category)
        {
            var books = await _filterService.FilterByCategoryAsync(category);
            return Ok(books);
        }

        [HttpGet("/filter/genre/{genre}")]
        public async Task<IActionResult> FilterBooksByGenre(Genre genre)
        {
            var books = await _filterService.FilterByGenreAsync(genre);
            return Ok(books);
        }

        [HttpGet("/filter/format/{format}")]
        public async Task<IActionResult> FilterBooksByFormat(Format format)
        {
            var books = await _filterService.FilterByFormatAsync(format);
            return Ok(books);
        }

        [HttpGet("/filter/new-arrivals")]
        public async Task<IActionResult> FilterByNewArrivals(DateTime arrivalDate)
        {
            var newArrivals = await _filterService.FilterByNewArrivalAsync(arrivalDate);
            return Ok(newArrivals);
        }

        [HttpGet("/filter/collectors")]
        public async Task<IActionResult> FilterByCollectors()
        {
            var collectors = await _filterService.FilterByCollectorsAsync();
            return Ok(collectors);
        }

        [HttpGet("/filter/paperbacks")]
        public async Task<IActionResult> FilterByPaperbacks()
        {
            var paperbacks = await _filterService.FilterByPaperbacksAsync();
            return Ok(paperbacks);
        }

        [HttpGet("/filter/fantasy")]
        public async Task<IActionResult> FilterByFantasy()
        {
            var fantasy = await _filterService.FilterByFantasyAsync();
            return Ok(fantasy);
        }

        [HttpGet("/filter/adventure")]
        public async Task<IActionResult> FilterByAdventure()
        {
            var adventure = await _filterService.FilterByAdventureAsync();
            return Ok(adventure);
        }

        [HttpGet("/filter/science")]
        public async Task<IActionResult> FilterByScience()
        {
            var science = await _filterService.FilterByScienceAsync();
            return Ok(science);
        }

        [HttpGet("/filter/fiction")]
        public async Task<IActionResult> FilterByFiction()
        {
            var fiction = await _filterService.FilterByFictionAsync();
            return Ok(fiction);
        }

        [HttpGet("/filter/nonfiction")]
        public async Task<IActionResult> FilterByNonFiction()
        {
            var nonfiction = await _filterService.FilterByNonFictionAsync();
            return Ok(nonfiction);
        }

    }
}
