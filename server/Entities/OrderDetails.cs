using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace server.Entities {
    public class OrderDetails {
        [Key]
        public Guid OrderDetailsId {get; set;}

        [ForeignKey("OrderId")]
        [ValidateNever]
        public Order Order {get; set;}
        public Guid OrderId { get; set; }
        
        [ForeignKey("BookId")]
        [ValidateNever]
        public Book Book {get; set;}
        public Guid BookId { get; set; }
        public int OrderQuantity {get; set;}
        public double Price {get; set;}
    }
}