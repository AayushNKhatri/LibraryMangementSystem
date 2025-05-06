using Microsoft.AspNetCore.Mvc;
using server.Dtos;
using server.Entities;
using server.Services.Interface;


namespace server.Controllers
{
    [ApiController]
    [Route("api/Books")]
    public class BookController(IBookInterface bookService) : Controller
    {
        [HttpPost("AddBooks")]

        public async Task <IActionResult> AddBook([FromBody] BookDto bookDto)
        {
            var bookModel = new Book
            {
                BookId = Guid.NewGuid(),
                Title = bookDto.Title,
                ISBN = bookDto.ISBN,
                Description = bookDto.Description,
                PublicationDate = bookDto.PublicationDate,
                Publisher = bookDto.Publisher,
                Language = bookDto.Language,
                CreatedDate = bookDto.CreatedDate,
                Status = bookDto.Status,
            };
            var filterModel = new BookFilters
            {
                BookFilterID = Guid.NewGuid(),
                BookId = bookModel.BookId,
                Category = bookDto.Category,
                Genre = bookDto.Genre,
                Format = bookDto.Format,
            };
            var bookInventoryModel = new BookInventory
            {
                BookInventoryId = Guid.NewGuid(),
                BookId = bookModel.BookId,
                Quantity = bookDto.Quantity,
                Price = bookDto.Price,
                IsOnSale = bookDto.IsOnSale,
                DiscountPercent = bookDto.DiscountPercent,
                DiscoundStartDate = bookDto.DiscoundStartDate,
                DiscoundEndDate = bookDto.DiscoundEndDate,
            };
            await bookService.AddBooks(bookModel, filterModel, bookInventoryModel);
            return Ok("Book Added");
        }
        [HttpGet]
        public async Task<IActionResult> GetAllBooks()
        {
            var book = await bookService.GetBooks();
            return Ok(book);
        }
    }
}
