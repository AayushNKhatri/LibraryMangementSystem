using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Entities
{
    [Table("User")]
    public class User : IdentityUser
    {
        [Key]
        public Guid UserId {get; set;}
        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string Contact { get; set; } = string.Empty;

        public string City { get; set; } = string.Empty;

        public int succesfullOrderCount {get; set; } = 0;

        public double stackableDiscount {get; set; };
    }
}
