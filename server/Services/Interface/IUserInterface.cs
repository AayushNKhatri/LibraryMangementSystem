using server.Dtos;
using server.Entities;
namespace server.Services.Interface
{
    public interface IUserInterface
    {
        Task RegisterUser(InsertUserDto registerUser);
        Task<string> Login(LoginDto request);
        Task<string> CreateToken(User user);
        Task<List<GetAllUserDto>> GetAllUsers();
        GetAllUserDto GetById(Guid id);
        void DeleteUser(Guid id);
        void updateUser(Guid id, UpdateUserDto updateUserDto);
    }
}
