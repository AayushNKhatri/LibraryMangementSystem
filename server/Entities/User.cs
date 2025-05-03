using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Entities
{
    [Table("User")]
    public class User : IdentityUser
    {
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string LastName { get; set; }
        [Required]
        [Phone]
        public string Contact { get; set; }
        [Required]
        public string City { get; set; }
        [Required]
        public string Street {get; set;}
        public int succesfullOrderCount {get; set; }
        public double stackableDiscount {get; set; }
    }
}
