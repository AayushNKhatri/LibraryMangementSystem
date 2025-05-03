using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace server.Entities
{
    [Table("User")]
    public class User : IdentityUser
    {

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string Contact { get; set; }

        public string City { get; set; }
    }
}
