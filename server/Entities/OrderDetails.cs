using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using server.Entities.Enum;

namespace server.Entities {
    public class OrderDetails {
        [Required]
        [Key]
        public Guid OrderDetailsId {get; set;}

        [Required]
        [ForeignKey("OrderId")]
        public Guid OrderId {get; set;}

        [Required]
        [ForeignKey("BookId")]
        public Guid BookId {get; set;}

        [Required]
        public int OrderQuantity {get; set;}

        [Required]
        public decimal OrderedPrice {get; set;}
    }
}