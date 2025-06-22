using Microsoft.EntityFrameworkCore;
using escorts_directory.Models;

namespace escorts_directory.Context
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<escorts> escorts { get; set; }
        public DbSet<inform> inform { get; set; }
        public DbSet<phoneNumber> phoneNumber { get; set; }
        public DbSet<EscortServiceEntry> EscortServices { get; set; }
        public DbSet<Service> Services { get; set; } // <-- додай, якщо ще немає

    }
}
