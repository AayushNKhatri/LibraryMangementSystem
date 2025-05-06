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
    public class UserController(IUserInterface userServices, UserManager<User> _userManager) : Controller
    {
        [HttpPost("Register-User")]

        public async Task<IActionResult> AddUser([FromBody] InsertUserDto userDto)
        {
            try{
                await userServices.RegisterUser(userDto);
                return Ok("User successfully registered");

            }catch(Exception ex){
                throw new Exception("Registration failed" + ex.Message);
            }
        }

        [HttpPost("Login")]
        public async Task<IActionResult>Login([FromBody] LoginDto request)
        {
            try{
                var req = await userServices.Login(request);
                return Ok(req);
            }
            catch(Exception ex){
                throw new Exception("Login faile"+ex.Message);
            }
        }

        [Authorize]
        [HttpPost("Get-User")]
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
                throw new Exception($"Error fetching User:{ex.Message}");
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
                return Ok("Email confirmed successfully!");
            else
                return BadRequest("Email confirmation failed.");
        }
    }
}
