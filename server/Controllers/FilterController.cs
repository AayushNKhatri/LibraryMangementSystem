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
        public async Task<ActionResult> FilterByAuthorAsync()
        {
            var authors = await _filterService.FilterByAuthorAsync();
            return authors.Any() ? Ok(authors) : NotFound("Sorry, we couldn't find the author you're looking for");
        }
    }
}