using server.Services.Interface;
using server.Dtos;
using server.Entities;
using server.Database;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Threading.Tasks;

namespace server.Services
{
    public class UserService : IUserInterface
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly ILogger<User> _logger;
        private readonly ApplicationDbContext _context; 
        private readonly IConfiguration _configuration;

        public UserService(UserManager<User> userManager, SignInManager<User> signInManager, ApplicationDbContext context, IConfiguration configuration, ILogger<User> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _context = context;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task RegisterUser(InsertUserDto registerUser)
        {
            try
            {
                if(await _context.Users.AnyAsync(u => u.Email == registerUser.Email || u.UserName == registerUser.UserName))
                {
                    throw new Exception("User already exists.");
                }

                var userModel = new User 
                { 
                    UserName = registerUser.UserName,
                    Email = registerUser.Email,
                    FirstName = registerUser.FirstName,
                    LastName = registerUser.LastName,
                    City = registerUser.City,
                    Contact = registerUser.Contact,
                    Street = registerUser.Street
                };
                var result = await _userManager.CreateAsync(userModel, registerUser.Password);

                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(userModel,"User");
                }
                else
                {
                    throw new Exception("User registration failed");
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Registration Failed:" + ex.Message);
            } 
        }
        public async Task<string> CreateToken(User user)
        {
            if (string.IsNullOrEmpty(user.Id))
            {
                throw new ArgumentException("User ID cannot be null or empty.");
            }
            var roles = await _userManager.GetRolesAsync(user);
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email ?? string.Empty), 
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty)
            };
            //Assigning roles to claim
            if(roles.Any())
            {
                foreach(var role in roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                }
            }
            else
            {
                claims.Add(new(ClaimTypes.Role,"User"));
            }
            var tokenKey = _configuration.GetValue<string>("TokenSettings:Token");
            if (string.IsNullOrEmpty(tokenKey))
            {
                throw new InvalidOperationException("Token key is not configured properly.");
            }
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);
            var tokenDescriptor = new JwtSecurityToken
            (
                issuer: _configuration["TokenSettings:Issuer"],
                audience: _configuration["TokenSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: credentials
            );
            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }
              public async Task<string> Login(LoginDto request)
        {
            try
            {
                var user = await _userManager.FindByEmailAsync(request.Email);
                if (user == null)
                {
                    throw new Exception("Invalid credentials.");
                }
                var result = await _signInManager.CheckPasswordSignInAsync(user,request.Password, false);
                if (result.Succeeded)
                {
                    _logger.LogInformation("User logged in successfully.");
                    return await CreateToken(user);
                }
                else
                {
                    throw new Exception("Invalid login attempt.");
                }
            }
            catch(Exception ex)
            {
                throw new Exception("Login failed: " + ex.Message);
            }
        }
        public async Task<List<GetAllUserDto>> GetAllUsers()
        {
            var users = await _context.Users.ToListAsync();
            if(users == null)
            {
                throw new Exception("Users not available");
            }
            var result= users.Select(user=>new GetAllUserDto
            {
                UserName = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Street = user.Street,
                City = user.City,
                Contact = user.Contact
            }).ToList();
            return result;
        }
        public GetAllUserDto GetById(Guid id)
        {
            throw new NotImplementedException();
        }

        public void DeleteUser(Guid id)
        {
            throw new NotImplementedException();
        }

        public void updateUser(Guid id, UpdateUserDto updateUserDto)
        {
            throw new NotImplementedException();
        }
    }
}