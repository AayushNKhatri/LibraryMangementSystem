using server.Entities;

namespace server.Services.Interface
{
    public interface IReviewService
    {
        Task<Review> CreateReview(Review review);
        Task<Review> UpdateReview(Review review, Guid id, string userID);
        Task<List<Review>> GetReview();
        Task<Review> GetReviewById(Guid id);
        Task<bool> DeleteReview(Guid id, string userID);
        Task<Review> GetReviewByBookId(Guid id);
    }
}
