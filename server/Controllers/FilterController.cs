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
            return books.Any() ? Ok(books) : NotFound("No books found for that language.");
        }

        [HttpGet("/filter/status/{status}")]
        public async Task<IActionResult> FilterBooksByStatus(Status status)
        {
            var books = await _filterService.FilterByStatusAsync(status);
            return books.Any() ? Ok(books) : NotFound("No books found with the specified status.");
        }

        [HttpGet("/filter/category/{category}")]
        public async Task<IActionResult> FilterBooksByCategory(Category category)
        {
            var books = await _filterService.FilterByCategoryAsync(category);
            return books.Any() ? Ok(books) : NotFound("No books found in that category.");
        }

        [HttpGet("/filter/genre/{genre}")]
        public async Task<IActionResult> FilterBooksByGenre(Genre genre)
        {
            var books = await _filterService.FilterByGenreAsync(genre);
            return books.Any() ? Ok(books) : NotFound("No books found for that genre.");
        }

        [HttpGet("/filter/format/{format}")]
        public async Task<IActionResult> FilterBooksByFormat(Format format)
        {
            var books = await _filterService.FilterByFormatAsync(format);
            return books.Any() ? Ok(books) : NotFound("No books found for that format.");
        }
        
        [HttpGet("/filter/author")]
        public async Task<IActionResult> FilterByAuthorAsync()
        {
            var authors = await _filterService.FilterByAuthorAsync();
            return authors.Any() ? Ok(authors) : NotFound("Sorry, we couldn't find the author you're looking for");
        }

        [HttpGet("/filter/new-arrivals")]
        public async Task<IActionResult> FilterByNewArrivals(DateTime arrivalDate)
        {
            var newArrivals = await _filterService.FilterByNewArrivalAsync(arrivalDate);
            return newArrivals.Any() ? Ok(newArrivals) : NotFound("No new arrivals found");
        }

        [HttpGet("/filter/collectors")]
        public async Task<IActionResult> FilterByCollectors()
        {
            var collectors = await _filterService.FilterByCollectorsAsync();
            return collectors.Any() ? Ok(collectors) : NotFound("No collectors found");
        }

        [HttpGet("/filter/paperbacks")]
        public async Task<IActionResult> FilterByPaperbacks()
        {
            var paperbacks = await _filterService.FilterByPaperbacksAsync();
            return paperbacks.Any() ? Ok(paperbacks) : NotFound("No paperbacks found");
        }

        [HttpGet("/filter/fantasy")]
        public async Task<IActionResult> FilterByFantasy()
        {
            var fantasy = await _filterService.FilterByFantasyAsync();
            return fantasy.Any() ? Ok(fantasy) : NotFound("No fantasy books found");
        }

        [HttpGet("/filter/adventure")]
        public async Task<IActionResult> FilterByAdventure()
        {
            var adventure = await _filterService.FilterByAdventureAsync();
            return adventure.Any() ? Ok(adventure) : NotFound("No adventure books found");
        }

        [HttpGet("/filter/science")]
        public async Task<IActionResult> FilterByScience()
        {
            var science = await _filterService.FilterByScienceAsync();
            return science.Any() ? Ok(science) : NotFound("No science books found");
        }

        [HttpGet("/filter/fiction")]
        public async Task<IActionResult> FilterByFiction()
        {
            var fiction = await _filterService.FilterByFictionAsync();
            return fiction.Any() ? Ok(fiction) : NotFound("No fiction books found");
        }

        [HttpGet("/filter/nonfiction")]
        public async Task<IActionResult> FilterByNonFiction()
        {
            var nonfiction = await _filterService.FilterByNonFictionAsync();
            return nonfiction.Any() ? Ok(nonfiction) : NotFound("No nonfiction books found");
        }
        
    }
}