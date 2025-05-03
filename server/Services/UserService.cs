using server.Services.Interface;
using server.Dtos;
using server.Entities;
using server.Database;
using Microsoft.AspNetCore.Identity;

namespace server.Services
{
    public class UserService : IUserInterface
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _singInMannager;
        private readonly ApplicationDbContext _context; 

        public UserService(UserManager<User> userManager, SignInManager<User> singInMannager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _singInMannager = singInMannager;
            _context = context;
        }
        public async Task RegisterUser(InsertUserDto registerUser)
        {
            try
            {
                var userModel = new User { 
                    UserName = registerUser.UserName,
                    Email = registerUser.Email,
                    FirstName = registerUser.FirstName,
                    LastName = registerUser.LastName,
                    City = registerUser.City,
                    Contact = registerUser.Contact,
                };
                var user = await _userManager.CreateAsync(userModel, registerUser.Password) ;
            }
            catch (Exception ex)
            {
                throw new Exception("User Not Register" + ex.Message);
            }
            
        }
    }
}
