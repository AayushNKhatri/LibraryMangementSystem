using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using server.Entities.Enum;

namespace server.Entities {
    public class Review {
        [Key]
        public Guid ReviewId {get; set;}

        [ForeignKey("UserId")]
        [ValidateNever]
        public User User {get; set;}
        public string UserId { get; set; }

        [ForeignKey("BookId")]
         [ValidateNever]
        public Book Book {get; set;}
        public Guid BookId { get; set; }

        [Required]
        public int Rating {get; set;}

        [Required]
        public string Comment {get; set;}
    }
}