using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Entities;
using server.Services.Interface;
using System.Security.Claims;

namespace server.Controllers
{
    [ApiController]
    [Route("api/notification")]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Notification>>> GetUserNotifications()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }

            var notifications = await _notificationService.GetNotifications(userId);
            return Ok(notifications);
        }

        [HttpPost("markAsRead/{notificationId}")]
        [Authorize]
        public async Task<IActionResult> MarkAsRead(int notificationId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }

            // Implementation for marking notification as read would go here
            // For now, just return a success response
            return Ok(new { success = true });
        }
    }
} 