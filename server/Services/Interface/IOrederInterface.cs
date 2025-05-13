using Microsoft.AspNetCore.Mvc;
using server.Dtos;
using server.Entities;

namespace server.Services.Interface
{
    public interface IOrederInterface
    {
        Task<CreateCartDto> CreateCart(string userId, Guid bookId, CreateCartDto createCart);
        Task<List<Cart>> GetCart(string userId);
        Task<Order> OrderConformation(string userId);
        Task<List<Order>> GetOrder();
        Task<List<Order>> GetOrderById(string userId);
        Task<bool> AddCartItem(string userId,Guid bookId);
        Task<bool> DecreaseCartItem(string userId,Guid bookId);
        Task<bool> RemoveCartItem(string userId,Guid bookId);
        Task<bool> StacableOrderCount(string userId);
        Task<bool> SendEmail(string userId, Guid orderId);   
        Task<bool> ManageOrdersComplete(Guid orderId, string userId, Guid claimsCode);
        Task<bool> ManageOrdersCancelled(Guid orderId, string userId);
    }
}