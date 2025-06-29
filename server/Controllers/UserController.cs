using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using server.Dtos;
using server.Entities;
using server.Services.Interface;

namespace server.Controllers
{
    [ApiController]
    [Route("api/User")]
    public class UserController(IUserInterface userServices, UserManager<User> _userManager, ILogger<User> _logger) : Controller
    {
        [HttpPost("Register-User")]
        public async Task<IActionResult> AddUser([FromBody] InsertUserDto userDto)
        {
            try{
                await userServices.RegisterUser(userDto);
                return Ok("User successfully registered");
            }catch(Exception ex){
                return BadRequest($"Registration failed: {ex.Message}");
            }
        }

        [HttpPost("Login")]
        public async Task<IActionResult>Login([FromBody] LoginDto request)
        {
            try{
                var token = await userServices.Login(request);

                // Return a proper response object with the token
                return Ok(token);
            }
            catch(Exception ex){
                // Return a clean error message
                return BadRequest(ex.Message.Replace("Login failed: ", ""));
            }
        }

        [Authorize]
        [HttpGet("Get-User")]
        public async Task<IActionResult> GetAllUser()
        {
            try{
                var result = await userServices.GetAllUsers();
                if(result == null)
                {
                    return NotFound("No user found");
                }
                return Ok(result);
            }
            catch(Exception ex){
                return BadRequest($"Error fetching users: {ex.Message}");
            }
        }

        [Authorize]
        [HttpGet("Get-User-By-Id")]
        public async Task<IActionResult> GetUserById()
        {
            try{
                var user = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if(user == null) return Unauthorized("User not found");
                var result = await userServices.GetUsersById(user);
                if(result == null)
                {
                    return NotFound("No user found");
                }
                return Ok(result);
            }
            catch(Exception ex){
                return BadRequest($"Error fetching users: {ex.Message}");
            }
        }

        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail(string userId, string token)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return BadRequest("Invalid user ID");

            var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));
            var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

            if (result.Succeeded)
                return Redirect("http://localhost:5173/login");
            else
                return BadRequest("Email confirmation failed.");
        }

        [AllowAnonymous]
        [HttpPost("Forgot-Password")]
        public async Task<IActionResult> RequestPasswordReset([FromBody] ForgetPasswordDto forgetPassword)
        {
            try
            {
                await userServices.ForgotPassword(forgetPassword);
                return Ok("Password reset email sent.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [AllowAnonymous]
        [HttpGet("forgot-password")]
        public IActionResult RedirectToResetPassword([FromQuery] string token)
        {
            // Redirect to the frontend reset password page with the token
            return Redirect($"http://localhost:5173/reset-password?token={token}");
        }

        [AllowAnonymous]
        [HttpPost("request-password-reset")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPassword, [FromQuery] string token)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(resetPassword.Email);
                if(user == null)
                {
                    return BadRequest("User not found! Invalid Email Address");
                }
                var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));
                var result = await _userManager.ResetPasswordAsync(user, decodedToken, resetPassword.NewPassword);
                if(result.Succeeded)
                {
                    return Ok("Password Successfully Reset");
                }
                else
                {
                    return BadRequest("Password Reset Failed");
                }
            }
            catch(Exception ex)
            {
                return BadRequest($"Password Reset Failed: {ex.Message}");
            }
        }

        [Authorize]
        [HttpPut("update-user")]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserDto updateUser)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var user = await _userManager.FindByIdAsync(userId);
                if(user == null) return BadRequest("User not found");
                var result = await userServices.updateUser(userId, updateUser);
                if(result)
                {
                    return Ok("User Updated Successfully");
                }
                return BadRequest("User not updated");
            }
            catch(Exception ex){
                return BadRequest($"Update Failed: {ex.Message}");
            }
        }
    }
}
