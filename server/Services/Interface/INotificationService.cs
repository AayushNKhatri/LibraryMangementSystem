using server.Entities;

namespace server.Services.Interface
{
    public interface INotificationService
    {
        Task<Notification> CreateNotification(string userId, string message);
        Task<List<Notification>> GetNotificationsByUserId(string userId);
    }
}