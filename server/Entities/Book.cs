using System.ComponentModel.DataAnnotations;
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

        public string? Image {get; set; }

        [Required]
        public string AuthorNamePrimary {get; set;}

        public string? AuthorNameSecondary {get; set;}
        public string? AdditionalAuthorName {get; set;}

        [Required]
        public DateTime PublicationDate { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
        [Required]
        public Status Status { get; set; }

 // Prevent back-reference from being serialized
        public virtual ICollection<BookInventory> Inventories { get; set; }

        public virtual ICollection<BookFilters> Filters { get; set; }
    }
}
