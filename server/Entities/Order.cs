using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using server.Entities.Enum;

namespace server.Entities {
    public class Order {
        [Key]
        public Guid OrderId {get; set;}
        [ForeignKey("UserId")]
        [ValidateNever]
        public User User {get; set;}
        public string UserId {get; set;}

        [Required]
        public DateTime OrderDate{get; set;}

        [Required]
        public int BookCount {get; set;}

        [Required]
        public double TotalAmount {get; set;}

        [Required]
        public OrderStatus OrderStatus {get; set;}

        [Required]
        public int DiscountApplied {get; set;}

        public Guid ClaimsCode {get; set;}
    }
}