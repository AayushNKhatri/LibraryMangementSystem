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
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.HttpResults;

namespace server.Services
{
    public class UserService : IUserInterface
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly ILogger<User> _logger;
        private readonly ApplicationDbContext _context; 
        private readonly IConfiguration _configuration;
        private readonly IEmailSender _emailSender;
        public UserService(UserManager<User> userManager, 
                           SignInManager<User> signInManager, 
                           ApplicationDbContext context, 
                           IConfiguration configuration, 
                           ILogger<User> logger, 
                           IEmailSender emailSender)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _context = context;
            _logger = logger;
            _configuration = configuration;
            _emailSender = emailSender;
        }
        //user registration method
        public async Task<string> RegisterUser(InsertUserDto registerUser)
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
                    var emailConformationToken =  await SendEmailConformation(userModel);
                    return emailConformationToken;
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
        //send conformation email method
        public async Task<string> SendEmailConformation(User user)
        {
            try
            {
                var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
                var confirmationLink = $"http://localhost:5129/api/User/confirm-email?userId={user.Id}&token={encodedToken}";
                _logger.LogInformation($"Confirmation Link: {confirmationLink}");
                var emailMessage = $@"
                                    <h2>Hi {user.FirstName},</h2>
                                    <p>Thank you for registering. Please confirm your email by clicking the link below:</p>
                                    <a href='{confirmationLink}'>Confirm Email</a>";

                await _emailSender.SendEmailAsync(user.Email, "Confirm Your Email", emailMessage);
                return encodedToken;
            }
            catch(Exception ex)
            {
                throw new Exception($"Email sending failed: {ex.Message}");
            }
        }
        //JWT token creating method
        public async Task<string> CreateJwtToken(User user)
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
        //user login method
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
                    return await CreateJwtToken(user);
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
        //get all user method
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
        public async Task<bool> updateUser(string userId, UpdateUserDto updateUserDto)
        {
            var userFromDb = await _context.Users.FirstOrDefaultAsync(u=>u.Id == userId);

            if(userFromDb == null)
            {
                throw new Exception("User not found");
            }
            _context.Entry(userFromDb).CurrentValues.SetValues(updateUserDto);
            await _context.SaveChangesAsync();
            return true;
        }
        public async Task<string> ForgotPassword(ForgetPasswordDto forgetPassword)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == forgetPassword.Email);
            if(user == null){
                throw new Exception("Email not found");
            }
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var confirmationLink = $"http://localhost:5129/api/User/forgot-password?userId={user.Id}&token={encodedToken}";
            _logger.LogInformation($"Confirmation Link: {confirmationLink}");
            var emailMessage = $@"
                                <h2>Hi {user.FirstName},</h2>
                                <p>Please click the link to reset your password:</p>
                                <a href='{confirmationLink}'>Reset Password</a>";

                await _emailSender.SendEmailAsync(user.Email, "Reset Your Password", emailMessage);
                return encodedToken;
        }

        public void DeleteUser(string userId)
        {
            throw new NotImplementedException();
        }
    }
}