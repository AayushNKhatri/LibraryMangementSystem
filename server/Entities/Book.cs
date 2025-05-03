using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using server.Entities.Enum;

namespace server.Entities
{
    public class Book
    {
        [Key]
        public Guid BookId { get; set; } 
        [Required]
        public string Title { get; set; }
        [Required]
        [StringLength(13, ErrorMessage =("The ISBN number cannot be greater than 13"))]
        public string ISBN { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        public string Publisher { get; set; }
        [Required]
        public BookLanguage Language { get; set; }
        [Required]
        public double Price {get; set;}
        [Required]
        public DateTime PublicationDate { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        [Required]
        public Status Status { get; set; }
    }
}