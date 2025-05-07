using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using server.Dtos;
using server.Entities;
using server.Services.Interface;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController(IOrederInterface orderService, UserManager<User> _userManager, ILogger<User> _logger) : ControllerBase
    {
        [HttpPost("Add-To-Cart/{userId}/{bookId}")]
        public async Task<IActionResult> AddToCart([FromBody] CreateCartDto createCart, [FromRoute] string userId, [FromRoute]Guid bookId)
        {
            try
            {
                var request = await orderService.CreateCart(userId,bookId, createCart);
                if(request == null) return BadRequest("Items not added to cart");
                return Ok(request);
            }
            catch(Exception ex)
            {
                throw new Exception($"Cart not created {ex.Message}");
            }
        }
    }
}