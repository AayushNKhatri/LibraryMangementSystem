using Microsoft.AspNetCore.Identity;

namespace server.Services.Interface
{
    public interface ISeedRoleInterface
    {
        Task SeedRole(RoleManager<IdentityRole> roleManager);
    }
}