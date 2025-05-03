using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace server.Entities {
    public class Cart 
    {
        [Key]
        public Guid CartId { get; set; }
        [ForeignKey("UserId")]
        [ValidateNever]
        public User User {get; set; }
        public string UserId {get; set;}
        [ForeignKey("BookId")]
        [ValidateNever]
        public Book Book {get; set;}
        public Guid BookId {get; set;}
        [Range(1,100,ErrorMessage =("Invalid: Enter number from 1 and 100"))]
        public int Count {get; set;}
    }
}