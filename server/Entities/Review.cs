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
        [Required]
        [Key]
        public Guid ReviewId {get; set;}

        [Required]
        [ForeignKey("UserId")]
        public Guid UserId {get; set;}

        [Required]
        [ForeignKey("BookId")]
        public Guid BookId {get; set;}

        [Required]
        public int Rating {get; set;}

        [Required]
        public string Comment {get; set;} = string.Empty;
    }
}