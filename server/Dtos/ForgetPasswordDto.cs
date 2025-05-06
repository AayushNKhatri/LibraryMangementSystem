using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using SendGrid.Helpers.Mail;

namespace server.Dtos
{
    public class ForgetPasswordDto
    {
        [Required]
        [EmailAddress]
        [DisplayName("Email Address")]
        public string Email {get; set;}
    }
}