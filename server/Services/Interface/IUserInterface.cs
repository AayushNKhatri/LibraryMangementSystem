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
        GetAllUserDto GetById(Guid id);
        void DeleteUser(Guid id);
        void updateUser(Guid id, UpdateUserDto updateUserDto);
    }
}
