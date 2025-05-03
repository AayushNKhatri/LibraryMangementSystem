using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace server.Entities
{
    public class BookInventory
    {
        [Required]
        [Key]
        public Guid BookId { get; set; }
        [Required]
        public int Quantity { get; set; }
        [Required]
        public double Price { get; set; }
        [Required]
        public int isOnSale { get; set; }
        [Required]
        public int DiscountPercent { get; set; }
        [Required]
        public DateTime DiscoundStartDate { get; set; }
        [Required]
        public DateTime DiscoundEndDate{get; set;}
    }
}