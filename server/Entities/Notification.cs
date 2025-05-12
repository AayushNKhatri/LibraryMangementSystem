using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Entities
{
    public class Notification
    {
        [Key]
        public Guid NotificationId { get; set; }
        
        [ForeignKey("UserId")]
        public User User { get; set; }
        public string UserId { get; set; }
        
        public string Message { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsRead { get; set; } = false;
    }
}