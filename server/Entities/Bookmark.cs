using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace server.Entities
{
    public class Bookmark
    {
        [Key]
        public Guid BookmarkId { get; set; }
        [ForeignKey("BookId")]
        [ValidateNever]
        public Book Book {get; set;}
        public Guid BookId {get; set;}
        [ForeignKey("UserId")]
        [ValidateNever]
        public User User {get; set;}
        public string UserId { get; set; }
    }
}