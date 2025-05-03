using server.Dtos;
namespace server.Services.Interface
{
    public interface IUserInterface
    {
       Task RegisterUser(InsertUserDto registerUser);
    }
}
