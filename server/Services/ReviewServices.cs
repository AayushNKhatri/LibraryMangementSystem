using Microsoft.EntityFrameworkCore;
using server.Database;
using server.Entities;
using server.Services.Interface;
namespace server.Services
{
    public class ReviewServices(ApplicationDbContext _dbContext) : IReviewService
    {
        public async Task<Review> CreateReview(Review reviewModel)
        {
            await _dbContext.Reviews.AddAsync(reviewModel);
            await _dbContext.SaveChangesAsync();
            return reviewModel;
        }

        public async Task<bool> DeleteReview(Guid id, string userID)
        {

            var review = await _dbContext.Reviews.FirstOrDefaultAsync(u => u.ReviewId == id);

            if (review == null)
                throw new Exception("No review found by that id");
            if(review.UserId != userID) throw new Exception("You are not valid to delete the review");
            _dbContext.Reviews.Remove(review);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<List<Review>> GetReview()
        {
            var allReview = await _dbContext.Reviews.ToListAsync();
            return allReview;
        }

        public async Task<Review> GetReviewById(Guid id)
        {
            var review = await _dbContext.Reviews.FirstOrDefaultAsync(x => x.ReviewId == id);
            return review;
        }

        public async Task<Review> UpdateReview(Review review, Guid id, string userID)
        {
            var existingReview = await _dbContext.Reviews.FirstOrDefaultAsync(x => x.ReviewId == id);
            if (existingReview == null)
                throw new Exception("Review not found");
            if(review.UserId != userID) throw new Exception("You are not valid to update the review");
            existingReview.Rating = review.Rating;
            existingReview.Comment = review.Comment;

            await _dbContext.SaveChangesAsync();
            return existingReview;
        }
        public async Task<Review> GetReviewByBookId(Guid id){
            var review = await _dbContext.Reviews.Include(x => x.User).Include(x => x.Book).FirstOrDefaultAsync(x => x.BookId == id);
            return review;
        }
    }
}
