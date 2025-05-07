using Microsoft.AspNetCore.Mvc;
using server.Dtos;
using server.Entities;

namespace server.Services.Interface
{
    public interface IOrederInterface
    {
        Task<CreateCartDto> CreateCart(string userId, Guid bookId, CreateCartDto createCart);
        Task OrderSummary();
        Task OrderConformation();
        Task Add(Guid cartId);
        Task Minus(Guid cartId);
        Task Remove(Guid cartId);
    }
}