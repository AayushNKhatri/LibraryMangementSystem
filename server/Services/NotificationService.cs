using Microsoft.EntityFrameworkCore;
using server.Database;
using server.Entities;
using server.Services.Interface;
using SignalR.hub;
using Microsoft.AspNetCore.SignalR;

public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _context;
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationService(ApplicationDbContext context, IHubContext<NotificationHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    public async Task CreateNotification(string userId, string message)
    {
        var notification = new Notification
        {
            UserId = userId,
            NotificationDescription = message,
            NotificationDate = DateTime.UtcNow,
            IsRead = false,
            Type = "AddOrder"
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        await _hubContext.Clients.Group(userId).SendAsync("ReceiveNotification", new
        {
            id = notification.Id,
            title = "Order Update",
            message = notification.NotificationDescription,
            date = notification.NotificationDate,
            read = notification.IsRead
        });
    }

    public async Task<IEnumerable<Notification>> GetNotifications(string userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.NotificationDate)
            .ToListAsync();
    }
    
    public async Task<Notification> GetNotificationById(Guid notificationId)
    {
        return await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId);
    }
    
    public async Task MarkAsRead(Guid notificationId)
    {
        var notification = await _context.Notifications.FindAsync(notificationId);
        if (notification != null)
        {
            notification.IsRead = true;
            await _context.SaveChangesAsync();
            
            // Send real-time update to the user
            if (!string.IsNullOrEmpty(notification.UserId))
            {
                await _hubContext.Clients.Group(notification.UserId).SendAsync("NotificationRead", notificationId);
            }
        }
    }
}
