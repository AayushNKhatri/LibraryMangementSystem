using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
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
        [Authorize]
        [HttpGet("Get-user-cart")]
        public async Task<IActionResult>GetCartItems()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if(string.IsNullOrEmpty(userId)) return Unauthorized("User not found");
                var req = await orderService.GetCart(userId);
                if(!req.Any())
                {   
                    return NotFound("The cart is empty");
                }
                return Ok(req);
            }
            catch(Exception ex)
            {
                throw new Exception($"Cannot fetch cart {ex.Message}");
            }
        }
        [Authorize]
        [HttpGet("get-order-summary")]
        public async Task<IActionResult>GetOrderSummary()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if(string.IsNullOrEmpty(userId)) return Unauthorized("No user found");
                var req = await orderService.OrderSummary(userId);
                if(!req.Any()) return NotFound("There is no item to show");
                return Ok(req);
            }
            catch(Exception ex)
            {
                throw new Exception($"Order summary not fetched {ex.Message}");
            }
        }
        [Authorize]
        [HttpPost("Add-order")]
        public async Task<IActionResult>CreateOrder()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if(string.IsNullOrEmpty(userId)) return Unauthorized("User not found");
                var req = await orderService.OrderConformation(userId);
                if(req == null) return NotFound("Order not made");
                await orderService.StacableOrderCount(userId);
                return Ok(req);
            }
            catch(Exception ex)
            {
                throw new Exception($"Order not created {ex.Message}");
            }
        }
        [Authorize]
        [HttpPatch("Increase-cartitem")]
        public async Task<IActionResult>IncreaseCartItem(Guid bookId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if(string.IsNullOrEmpty(userId)) return Unauthorized("user not found");
            var req = await orderService.AddCartItem(userId, bookId);
            if(req == false) return NotFound("Cart Item not incereased");
            return Ok(req);
        }
        [Authorize]
        [HttpPatch("decrease-cartitem")]
        public async Task<IActionResult>DecreaseCartItem(Guid bookId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if(string.IsNullOrEmpty(userId)) return Unauthorized("user not found");
            var req = await orderService.DecreaseCartItem(userId, bookId);
            if(req == false) return NotFound("Cart Item not decreased");
            return Ok(req);
        }
        [Authorize]
        [HttpPatch("remove-cartitem")]
        public async Task<IActionResult>RemoveCartItem(Guid bookId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if(string.IsNullOrEmpty(userId)) return Unauthorized("user not found");
            var req = await orderService.RemoveCartItem(userId, bookId);
            if(req == false) return NotFound("Cart Item not removed");
            return Ok(req);
        }
    }
}