using Microsoft.AspNetCore.Identity;
using server.Entities;

namespace server.Services
{
    public class SeedRoleService
    {
        public static async Task SeedRoleAsync(RoleManager<IdentityRole> roleManager)
        {
             if (!await roleManager.RoleExistsAsync("Admin"))
            {
                await roleManager.CreateAsync(new IdentityRole("Admin"));
            }

            if (!await roleManager.RoleExistsAsync("User"))
            {
                await roleManager.CreateAsync(new IdentityRole("User"));
            }
        }
        public static async Task SeedAdminAsync(UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
        {
            // 1. Ensure the role exists
            string adminRole = "Admin";
            if (!await roleManager.RoleExistsAsync(adminRole))
            {
                await roleManager.CreateAsync(new IdentityRole(adminRole));
            }

            // 2. Check if admin user exists
            string adminEmail = "admin@gmail.com";
            var existingAdmin = await userManager.FindByEmailAsync(adminEmail);

            if (existingAdmin == null)
            {
                // 3. Create the admin user with all required fields
                var adminUser = new User
                {
                    UserName = "admin",
                    Email = adminEmail,
                    EmailConfirmed = true,

                    // Custom fields
                    FirstName = "System",
                    LastName = "Administrator",
                    Contact = "9765422698",
                    City = "Kathmandu",
                    Street = "Thapathali"
                    // succesfullOrderCount = 0,
                    // stackableDiscount = 0.0
                };

                // 4. Create user with a strong password
                var result = await userManager.CreateAsync(adminUser, "AdminPassword@123");

                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, adminRole);
                }
                else
                {
                    // Log the error messages
                    foreach (var error in result.Errors)
                    {
                        Console.WriteLine(error.Description);
                    }
                }
            }
        }
    }
}
