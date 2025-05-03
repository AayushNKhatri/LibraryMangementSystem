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
            await userServices.RegisterUser(userDto);
            return Ok("Add User");
        }
    }
}
