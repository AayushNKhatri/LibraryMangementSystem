using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using server.Entities;

namespace server.Database
{
    public class ApplicationDbContext : IdentityDbContext<User>
    {
        public ApplicationDbContext(DbContextOptions options) :base(options){
        }
        public DbSet<Book> Books {get; set;}
        public DbSet<BookFilters> BookFilters {get; set;}
        public DbSet<Author> Authors {get; set;}
        public DbSet<BookInventory> BookInventories {get; set;}
        public DbSet<Cart> Carts {get; set;}
        public DbSet<Order> Orders {get; set;}
        public DbSet<OrderDetails> OrderDetails {get; set;}
        public DbSet<Review> Reviews {get; set;}
        public DbSet<User> Users {get; set;}
        public DbSet<Announcement> Announcements {get; set;}
    }
}
