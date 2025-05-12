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

        public async Task<bool> DeleteReview(Guid id)
        {
            var review =await _dbContext.Reviews.FirstOrDefaultAsync(u => u.ReviewId == id);
            if (review != null)
                throw new Exception("No review found by that id");
            var deleteReview = _dbContext.Reviews.Remove(review);
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

        public Task<Review> UpdateReview(Review review, Guid id)
        {
            var updateRevview = _dbContext.Reviews.FirstOrDefaultAsync(x => x.ReviewId == id);
            _dbContext.Entry(updateRevview).CurrentValues.SetValues(review);
            _dbContext.SaveChangesAsync();
            return updateRevview;

        }
    }
}
