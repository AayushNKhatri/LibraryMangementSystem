using System;
using System.Collections.Generic;

namespace server.Entities
{
    public class Notification
    {
        public int Id { get; set; }
        public string Message { get; set; }
        public DateTime CreatedAt { get; set; }

        // Foreign key to the user who receives the notification
        public string UserId { get; set; }
        public User User { get; set; }

        public bool IsRead { get; set; } = false;

        // Optional: type of notification (e.g., OrderConfirmed, Promo, etc.)
        public string Type { get; set; }
    }

}