using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using server.Services;
using server.Services.Interface;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookmarkController(IBookmarkServices _bookmarkServices) : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> AddToBookmark(Guid bookId){
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                bool book = await _bookmarkServices.AddBookmark(bookId, userId);
                if(!book)
                   throw new Exception("Cannot add to bookmark");

                return Ok("Sucesfully added bookmark");
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);

            }
        }
        [HttpDelete]
        public async Task<IActionResult> DeleteBookmark(Guid bookmarkId){
            try{
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var book = await _bookmarkServices.DeleteBookmark(bookmarkId);
                return Ok("Sucesfully Deleted");
            }
            catch{
                throw new Exception("Cant add bookmark");
            }
        }
        [HttpGet("GetAllBookmark")]
        public async Task<IActionResult> GetAllBookmark(){
            try{
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var bookmark = await _bookmarkServices.GetBookmark(userId);
                return Ok(bookmark);
            }
            catch(Exception ex){
                throw new Exception(ex.Message,ex);
            }
        }
        [HttpGet("BookmarkBy/{bookmarkId}")]
        public async Task<IActionResult> GetBookmarkById(Guid bookmarkId){
            try{
                var bookmark = await _bookmarkServices.GetBookmarkByID(bookmarkId);
                return Ok(bookmark);
            }
            catch(Exception ex){
                throw new Exception(ex.Message, ex);
            }
        }
    }
}
