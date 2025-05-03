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
    public class BookFilters
    {
         public Guid BookId { get; set; }
        [ForeignKey("BookId")]
        [ValidateNever]
        public Book Book { get; set; }

        [Required]
        public Category Category {get; set;}

        [Required]
        public Genre Genre {get; set;}

        [Required]
        public Format Format {get; set;}
    }
}