using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using SendGrid.Helpers.Mail;

namespace server.Dtos
{
    public class ResetPasswordDto
    {
        [Required]
        [EmailAddress]
        [DisplayName("Email Address")]
        public string Email {get; set;}
        [Required]
        [DisplayName("New Password")]
        public string NewPassword {get; set;}
    }
}