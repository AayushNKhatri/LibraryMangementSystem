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
            Message = message,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        await _hubContext.Clients.Group(userId).SendAsync("ReceiveNotification", new
        {
            id = notification.Id,
            title = "Order Update",
            message = notification.Message,
            date = notification.CreatedAt,
            read = notification.IsRead
        });
    }

    public async Task<IEnumerable<Notification>> GetNotifications(string userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }
}
