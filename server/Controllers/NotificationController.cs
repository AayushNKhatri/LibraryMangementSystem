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
        public async Task<IActionResult> MarkAsRead(Guid notificationId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User not authenticated");
            }

            try
            {
                // Get the notification from the database
                var notification = await _notificationService.GetNotificationById(notificationId);
                
                // Check if notification exists and belongs to the user
                if (notification == null)
                {
                    return NotFound("Notification not found");
                }
                
                if (notification.UserId != userId)
                {
                    return Forbid("You do not have permission to mark this notification as read");
                }
                
                // Mark notification as read
                await _notificationService.MarkAsRead(notificationId);
                
                return Ok(new { success = true, message = "Notification marked as read" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
} 