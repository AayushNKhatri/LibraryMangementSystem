using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using server.Dtos;
using server.Entities;
using server.Services.Interface;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewContoller(IReviewService _review) : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> CreateReview(Guid bookId, [FromBody]ReviewDTO reviewDTO)
        {
            try{
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var model = new Review{
                    ReviewId = Guid.NewGuid(),
                    UserId = userId,
                    BookId = bookId,
                    Rating = reviewDTO.Rating,
                    Comment = reviewDTO.Comment,
                };
                await _review.CreateReview(model);
                return Ok("Sucessfull Created");
            }
            catch(Exception ex){
                return StatusCode(500, ex.Message);
            }
        }
        [HttpPut]
        public async Task<IActionResult> UpdateReview([FromBody] ReviewDTO reviewDTO, Guid reviewId)
        {
            try{
                var model = new Review{
                    Rating = reviewDTO.Rating,
                    Comment = reviewDTO.Comment
                };
                await _review.UpdateReview(model, reviewId);
                return Ok("Review sucessfully updated");
            }
            catch(Exception ex){
                return StatusCode(500, ex.Message);
            }
        }
        [HttpDelete]
        public async Task<IActionResult> DeleteReview(Guid reviewId){
            try{
                bool delete = _review.DeleteReview(reviewId).Result;
                if(!delete)
                    throw new Exception("Error deleting");
                return Ok("Sucessfylly Deleted");
            }
            catch(Exception ex){
                return StatusCode(500, ex.Message);
            }
        }
        [HttpGet]
        public async Task<IActionResult> GetReviews(){
            try{
                var review = await _review.GetReview();
                return Ok(review);
            }
            catch(Exception ex){
                throw new Exception(ex.Message);
            }
        }
        [HttpGet]
        public async Task<IActionResult> GetReviewById(Guid reviewID){
            try{
                var review = await _review.GetReviewById(reviewID);
                return Ok(review);
            }
            catch(Exception ex){
                throw new Exception($"{ex.Message}");
            }
        }
    }
}
