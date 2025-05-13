using Microsoft.AspNetCore.Mvc;
using server.Dtos;
using server.Entities;
namespace server.Services.Interface
{
    public interface IUserInterface
    {
        Task<string> RegisterUser(InsertUserDto registerUser);
         Task<string> SendEmailConformation(User user);
        Task<string> Login(LoginDto request);
        Task<string> CreateJwtToken(User user);
        Task<List<GetAllUserDto>> GetAllUsers();
        Task<User> GetUsersById(string userId);
        void DeleteUser(string userId);
        Task<bool> updateUser(string userId, UpdateUserDto updateUserDto);
        Task<string> ForgotPassword([FromBody] ForgetPasswordDto forgetPassword);
    }
}
