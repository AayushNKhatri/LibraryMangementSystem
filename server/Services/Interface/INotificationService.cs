using server.Entities;
using System.Collections.Generic;

namespace server.Services.Interface
{
    public interface INotificationService
    {
        Task CreateNotification(string userId, string message);
        Task<IEnumerable<Notification>> GetNotifications(string userId);
        Task<Notification> GetNotificationById(Guid notificationId);
        Task MarkAsRead(Guid notificationId);
        Task<bool> DeleteNotification(Guid notificationId);
    }
}
