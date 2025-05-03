using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace server.Entities
{
    public class BookInventory
    {
        [Key]
        public Guid BookInventoryId { get; set; }
        [ForeignKey("BookId")]
        [ValidateNever]
        public Book Book {get; set;}
        public Guid BookId { get; set; }
        [Required]
        public int Quantity { get; set; }
        [Required]
        public double Price { get; set; }
        [Required]
        public bool IsOnSale { get; set; }
        [Required]
        public int DiscountPercent { get; set; }
        [Required]
        public DateTime DiscoundStartDate { get; set; }
        [Required]
        public DateTime DiscoundEndDate{get; set;}
    }
}