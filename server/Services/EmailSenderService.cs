using Microsoft.AspNetCore.Identity.UI.Services;
using SendGrid;
using SendGrid.Helpers.Mail;
using server.Services.Interface;

namespace server.Services
{
    public class EmailSenderService(IConfiguration configuration, ILogger<EmailSenderService> logger) : IEmailSender
    {
        public async Task SendEmailAsync(string toEmail, string subject, string message)
        {
            try
            {
                var sendGridApiKey = configuration["SendGrid:SendGridKey"];
                if(sendGridApiKey == null)
                {
                    throw new Exception("The SendGridAPI Key is not found");
                }
                var client = new SendGridClient(sendGridApiKey);
                var msg = new SendGridMessage()
                {
                    From = new EmailAddress(configuration["Sendgrid:From"],configuration["Sendgrid:Name"]),
                    Subject = subject,
                    PlainTextContent = message,
                    HtmlContent = message
                };
                msg.AddTo(new EmailAddress(toEmail));
                var response = await client.SendEmailAsync(msg);
                logger.LogInformation(response.IsSuccessStatusCode ? $"Email to {toEmail} queued successfully!": $"Failure email to {toEmail}");      
            }
            catch(Exception ex)
            {
                throw new Exception($"Email not sent to mail {ex.Message}");
            }
        }
    }
}