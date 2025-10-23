using Microsoft.EntityFrameworkCore;
using AmusementParkAPI.Models;

namespace AmusementParkAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Existing
        public DbSet<Customer> Customers { get; set; }
        public DbSet<UserLogin> UserLogins { get; set; }
        
        // Add these new DbSets
        public DbSet<TicketType> TicketTypes { get; set; }
        public DbSet<TicketSale> TicketSales { get; set; }
        public DbSet<CommodityType> CommodityTypes { get; set; }
        public DbSet<CommoditySale> CommoditySales { get; set; }
        public DbSet<Restaurant> Restaurants { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Map to your actual table names
            modelBuilder.Entity<Customer>().ToTable("customers");
            modelBuilder.Entity<UserLogin>().ToTable("user_login");
            modelBuilder.Entity<TicketType>().ToTable("ticket_type");
            modelBuilder.Entity<TicketSale>().ToTable("ticket_sale");
            modelBuilder.Entity<CommodityType>().ToTable("commodity_type");
            modelBuilder.Entity<CommoditySale>().ToTable("commodity_sale");
            modelBuilder.Entity<Restaurant>().ToTable("restaurant");

            // Primary keys
            modelBuilder.Entity<Customer>().HasKey(c => c.Customer_ID);
            modelBuilder.Entity<UserLogin>().HasKey(u => u.Login_ID);
            modelBuilder.Entity<TicketType>().HasKey(t => t.TicketType_ID);
            modelBuilder.Entity<TicketSale>().HasKey(t => t.Ticket_ID);
            modelBuilder.Entity<CommodityType>().HasKey(c => c.Commodity_TypeID);
            modelBuilder.Entity<CommoditySale>().HasKey(c => c.Commodity_SaleID);
            modelBuilder.Entity<Restaurant>().HasKey(r => r.Menu_ID);

            base.OnModelCreating(modelBuilder);
        }
    }
}