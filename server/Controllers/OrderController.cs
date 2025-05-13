using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Database;
using server.Dtos;
using server.Entities;
using server.Services.Interface;

namespace server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrderController(IOrederInterface orderService, UserManager<User> _userManager, ILogger<User> _logger) : ControllerBase
    {
        [HttpPost("Add-To-Cart/{bookId}")]
        public async Task<IActionResult> AddToCart([FromBody] CreateCartDto createCart, [FromRoute]Guid bookId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if(userId == null) return Unauthorized("User not found");
                var request = await orderService.CreateCart(userId,bookId, createCart);
                if(request == null) return BadRequest("Items not added to cart");
                return Ok(request);
            }
            catch(Exception ex)
            {
                throw new Exception("Cart not created: " + ex.InnerException?.Message);
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
                return Ok(req);
            }
            catch(Exception ex)
            {
                throw new Exception($"Cannot fetch cart {ex.Message}");
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
                throw new Exception("Cart not created: " + ex.InnerException?.Message);
            }
        }

        [Authorize]
        [HttpGet("Get-orders")]
        public async Task<IActionResult>GetAllOrders()
        {
            try
            {
                var req = await orderService.GetOrder();
                if(!req.Any()) return NotFound("Not orders to show");
                return Ok(req);
            }
            catch(Exception ex)
            {
                throw new Exception($"Orders is empty {ex.Message}");
            }
        }

        [Authorize]
        [HttpGet("Get-orders-by-id")]
        public async Task<IActionResult>GetAllOrdersById()
        {
            try
            {
                var user = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var req = await orderService.GetOrderById(user);
                if(!req.Any()) return NotFound("Not orders to show");
                return Ok(req);
            }
            catch(Exception ex)
            {
                throw new Exception($"Orders is empty {ex.Message}");
            }
        }




        [Authorize]
        [HttpPatch("Increase-cartitem/bookId")]
        public async Task<IActionResult>IncreaseCartItem([FromRoute] Guid bookId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if(string.IsNullOrEmpty(userId)) return Unauthorized("user not found");
            var req = await orderService.AddCartItem(userId, bookId);
            if(req == false) return NotFound("Cart Item not incereased");
            return Ok(req);
        }
        [Authorize]
        [HttpPatch("decrease-cartitem/{bookId}")]
        public async Task<IActionResult>DecreaseCartItem([FromRoute] Guid bookId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if(string.IsNullOrEmpty(userId)) return Unauthorized("user not found");
            var req = await orderService.DecreaseCartItem(userId, bookId);
            if(req == false) return NotFound("Cart Item not decreased");
            return Ok(req);
        }
        [Authorize]
        [HttpDelete("remove-cartitem/{bookId}")]
        public async Task<IActionResult>RemoveCartItem([FromRoute] Guid bookId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if(string.IsNullOrEmpty(userId)) return Unauthorized("user not found");
            var req = await orderService.RemoveCartItem(userId, bookId);
            if(req == false) return NotFound("Cart Item not removed");
            return Ok(req);
        }
        [HttpPatch("confirm-order")]
        public async Task<IActionResult>ConfirmOrder()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if(string.IsNullOrEmpty(userId)) return Unauthorized("User not found");
            var req = await orderService.OrderConformation(userId);
            return Ok(req);
        }
        [Authorize(Roles = "Admin")]
        [HttpPatch("complete-Order")]
        public async Task<IActionResult>ManageOrderComplete(Guid claimsCode, Guid orderId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if(string.IsNullOrEmpty(userId)) return Unauthorized("User not found");
            var req = await orderService.ManageOrdersComplete(orderId,userId,claimsCode);
            if(req == false) return NotFound("Order not completed");
            return Ok(req);
        }
        
        [Authorize]
        [HttpPatch("cancel-order")]
        public async Task<IActionResult>ManageOrderCancelled(Guid orderId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if(string.IsNullOrEmpty(userId)) return Unauthorized("User not found");
            var req = await orderService.ManageOrdersCancelled(orderId, userId);
            if(req == false) return NotFound("Order not completed");
            return Ok(req);
        }
    }
}