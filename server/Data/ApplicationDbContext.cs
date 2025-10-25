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
        public DbSet<MenuItem> MenuItems { get; set; }
        public DbSet<RestaurantOrder> RestaurantOrders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }

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
            modelBuilder.Entity<MenuItem>().ToTable("menu_item");
            modelBuilder.Entity<RestaurantOrder>().ToTable("restaurant_order");
            modelBuilder.Entity<OrderItem>().ToTable("order_item");

            // Primary keys
            modelBuilder.Entity<Customer>().HasKey(c => c.CustomerId);
            modelBuilder.Entity<UserLogin>().HasKey(u => u.UserId);
            modelBuilder.Entity<TicketType>().HasKey(t => t.TicketType_ID);
            modelBuilder.Entity<TicketSale>().HasKey(t => t.Ticket_ID);
            modelBuilder.Entity<CommodityType>().HasKey(c => c.Commodity_TypeID);
            modelBuilder.Entity<CommoditySale>().HasKey(c => c.Commodity_SaleID);
            modelBuilder.Entity<Restaurant>().HasKey(r => r.Restaurant_ID);
            modelBuilder.Entity<MenuItem>().HasKey(m => m.Menu_ID);
            modelBuilder.Entity<RestaurantOrder>().HasKey(o => o.Order_ID);
            modelBuilder.Entity<OrderItem>().HasKey(o => o.Order_Item_ID);

            base.OnModelCreating(modelBuilder);
        }
    }
}