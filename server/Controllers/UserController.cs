using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Dtos;
using server.Services.Interface;

namespace server.Controllers
{
    [ApiController]
    [Route("api/User")]
    public class UserController(IUserInterface userServices) : Controller
    {
        [HttpPost("RegisterUser")]

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
        [HttpPost("GetUser")]
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
    }
}
