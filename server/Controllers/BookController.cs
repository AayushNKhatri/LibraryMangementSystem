using System.Reflection;
using Microsoft.AspNetCore.Authorization;
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
        [Authorize(Roles = "Admin")]
        public async Task <IActionResult> AddBook([FromBody] BookDto bookDto)
        {
            var bookModel = new Book
            {
                BookId = Guid.NewGuid(),
                Title = bookDto.Title,
                ISBN = bookDto.ISBN,
                Description = bookDto.Description,
                AuthorNamePrimary = bookDto.AuthorName1,
                AuthorNameSecondary = bookDto.AuthorName2,
                AdditionalAuthorName = bookDto.AuthorName3,
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

        [HttpDelete("{bookId:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task <IActionResult> DeleteBook(Guid bookId)
        {
            try
            {
                await bookService.DeleteBook(bookId);
                return Ok("Book Deleted");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{bookId:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task <IActionResult> UpdateBook(Guid bookId, [FromBody] UpdateBookDto updateBookDto)
        {
            try
            {
                await bookService.UpdateBook(bookId, updateBookDto);
                return Ok("Book Updated Successfully");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{bookId:guid}")]

        public async Task<IActionResult> GetById(Guid bookId)
        {
            try
            {
                var book = await bookService.GetById(bookId);
                return Ok(book);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("BookImage/{bookId}")]
        public async Task<IActionResult> AddImage(Guid bookId, IFormFile image){
            try{
                await bookService.AddImage(bookId, image);
                return Ok("Image added sucess");
            }
            catch (Exception ex){
                throw new Exception(ex.Message);
            }
        }
        [HttpPatch("BookImage/{bookId}")]
        public async Task<IActionResult> UpdateImage (Guid bookId, IFormFile image){
            try{
                await bookService.UpdateImage(bookId, image);
                return Ok("Image Updated sucessfullty");
            }
            catch (Exception ex){
                throw new Exception(ex.Message);
            }
        }
    }
}
