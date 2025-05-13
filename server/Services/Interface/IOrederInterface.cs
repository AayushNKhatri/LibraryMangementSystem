using Microsoft.AspNetCore.Mvc;
using server.Dtos;
using server.Entities;

namespace server.Services.Interface
{
    public interface IOrederInterface
    {
        Task<CreateCartDto> CreateCart(string userId, Guid bookId, CreateCartDto createCart);
        Task<List<GetCartDto>> GetCart(string userId);
        Task<List<GetOrderSummaryDto>> OrderSummary(string userId);
        Task<Order> OrderConformation(string userId);
        Task<bool> AddCartItem(string userId,Guid bookId);
        Task<bool> DecreaseCartItem(string userId,Guid bookId);
        Task<bool> RemoveCartItem(string userId,Guid bookId);
        Task<bool> StacableOrderCount(string userId);
        Task<bool> SendEmail(User user);   
    }
}