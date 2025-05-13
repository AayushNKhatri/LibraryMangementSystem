using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace server.Entities
{
    public class Notification
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }
        public string NotificationDescription { get; set; }
        public DateTime NotificationDate { get; set; }

        [ForeignKey("UserId")]
        [ValidateNever]
        public User User { get; set; }
        public string? UserId { get; set; }

        public bool IsRead { get; set; } = false;

        // Optional: type of notification (e.g., OrderConfirmed, Promo, etc.)
        public string Type { get; set; }
    }
}