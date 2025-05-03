using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using server.Entities.Enum;

namespace server.Entities {
    public class Author {
        [Required]
        [Key]
        public Guid AuthorId {get; set;}

        [Required]
        public string AuthorName {get; set;} = string.Empty;
    }
}