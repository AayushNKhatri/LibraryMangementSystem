using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using server.Entities.Enum;

namespace server.Entities {
    public class Order {
        [Required]
        [Key]
        public Guid OrderId {get; set;}

        [Required]
        [ForeignKey("UserId")]
        public Guid UserId {get; set;}

        [Required]
        public DateTime OrderDate{get; set;}

        [Required]
        public int BookCount {get; set;}

        [Required]
        public decimal TotalAmt {get; set;}

        [Required]
        public OrderStatus OrderStatus {get; set;}

        [Required]
        public decimal DiscountApplied {get; set;}
    }
}