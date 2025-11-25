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

        public DbSet<Customer> Customers { get; set; }
        public DbSet<UserLogin> UserLogins { get; set; }
        
        // Tickets & Commodities
        public DbSet<TicketType> TicketTypes { get; set; }
        public DbSet<TicketSale> TicketSales { get; set; }
        public DbSet<CommodityType> CommodityTypes { get; set; }
        public DbSet<CommoditySale> CommoditySales { get; set; }
    public DbSet<MenuSale> MenuSales { get; set; }
        
        // Restaurant 
        public DbSet<Restaurant> Restaurants { get; set; }
        public DbSet<MenuItem> MenuItems { get; set; }
        public DbSet<MenuType> MenuTypes { get; set; }
        public DbSet<RestaurantOrder> RestaurantOrders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        
        // Rides
        public DbSet<Rides> Rides { get; set; }
        
        // Employee management
        public DbSet<Employee> Employees { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Role> Roles { get; set; }
        
        // Maintenance
        public DbSet<MaintenanceRequest> MaintenanceRequests { get; set; }
        public DbSet<MaintenanceLog> MaintenanceLogs { get; set; }

        // Alerts
        public DbSet<Alert> Alerts { get; set; }

        // Weather
        public DbSet<Weather> Weather { get; set; }

        // Reviews
        public DbSet<Reviews> Reviews { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Map to table names
            modelBuilder.Entity<Customer>().ToTable("customers");
            modelBuilder.Entity<UserLogin>().ToTable("user_login");
            modelBuilder.Entity<TicketType>().ToTable("ticket_type");
            modelBuilder.Entity<TicketSale>().ToTable("ticket_sale");
            modelBuilder.Entity<CommodityType>().ToTable("commodity_type");
            modelBuilder.Entity<CommoditySale>().ToTable("commodity_sale");
            modelBuilder.Entity<MenuSale>().ToTable("menu_sale");
            
            // Restaurant tables (YOUR MODULE)
            modelBuilder.Entity<Restaurant>().ToTable("restaurant");
            modelBuilder.Entity<MenuItem>().ToTable("menu_item");
            modelBuilder.Entity<MenuType>().ToTable("menu_type");
            modelBuilder.Entity<RestaurantOrder>().ToTable("restaurant_order");
            modelBuilder.Entity<OrderItem>().ToTable("order_item");
            
            // Other modules
            modelBuilder.Entity<Rides>().ToTable("ride");
            modelBuilder.Entity<Employee>().ToTable("employees");
            modelBuilder.Entity<Department>().ToTable("department");
            modelBuilder.Entity<Role>().ToTable("role");
            modelBuilder.Entity<MaintenanceRequest>().ToTable("maintenance_request");
            modelBuilder.Entity<MaintenanceLog>().ToTable("maintenance_log");
            modelBuilder.Entity<Alert>().ToTable("alerts");
            modelBuilder.Entity<Weather>().ToTable("weather");
            modelBuilder.Entity<Reviews>().ToTable("reviews");
    
            
            // Primary keys
            modelBuilder.Entity<Customer>().HasKey(c => c.CustomerId);
            modelBuilder.Entity<UserLogin>().HasKey(u => u.UserId);
            modelBuilder.Entity<TicketType>().HasKey(t => t.TicketType_ID);
            modelBuilder.Entity<TicketSale>().HasKey(t => t.Ticket_ID);
            modelBuilder.Entity<CommodityType>().HasKey(c => c.Commodity_TypeID);
            modelBuilder.Entity<CommoditySale>().HasKey(c => c.Commodity_SaleID);
            modelBuilder.Entity<MenuSale>().HasKey(m => m.Menu_ID);
            
            // Restaurant primary keys 
            modelBuilder.Entity<Restaurant>().HasKey(r => r.Restaurant_ID);
            modelBuilder.Entity<MenuItem>().HasKey(m => m.Menu_ID);
            modelBuilder.Entity<MenuType>().HasKey(m => m.MenuType_ID);
            modelBuilder.Entity<RestaurantOrder>().HasKey(o => o.Order_ID);
            modelBuilder.Entity<OrderItem>().HasKey(o => o.Order_Item_ID);
            
            // Other module primary keys
            modelBuilder.Entity<Rides>().HasKey(r => r.Ride_ID);
            modelBuilder.Entity<Employee>().HasKey(e => e.EmployeeId);
            modelBuilder.Entity<Department>().HasKey(d => d.DepartmentId);
            modelBuilder.Entity<Role>().HasKey(r => r.RoleId);
            modelBuilder.Entity<MaintenanceRequest>().HasKey(m => m.RequestId);
            modelBuilder.Entity<MaintenanceLog>().HasKey(m => m.LogId);
            modelBuilder.Entity<Alert>().HasKey(a => a.AlertId);
            modelBuilder.Entity<Weather>().HasKey(w => w.WeatherId);
            modelBuilder.Entity<Reviews>().HasKey(r => r.Review_ID);

            modelBuilder.Entity<TicketType>()
                .HasOne(t => t.Ride)
                .WithMany()
                .HasForeignKey(t => t.Ride_ID)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure MaintenanceRequest -> Alert relationship
            modelBuilder.Entity<MaintenanceRequest>()
                .HasOne(m => m.Alert)
                .WithMany(a => a.MaintenanceRequests)
                .HasForeignKey(m => m.AlertId)
                .IsRequired(false) // AlertId is optional (nullable)
                .OnDelete(DeleteBehavior.SetNull); // Set AlertId to null if alert is deleted

            // Configure MaintenanceRequest -> Employee (Reporter & Assignee)
            modelBuilder.Entity<MaintenanceRequest>()
                .HasOne(m => m.Reporter)
                .WithMany()
                .HasForeignKey(m => m.ReportedBy)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<MaintenanceRequest>()
                .HasOne(m => m.Assignee)
                .WithMany()
                .HasForeignKey(m => m.AssignedTo)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            // Configure MaintenanceLog -> Employee (PerformedBy) to set FK to NULL when employee is deleted
            modelBuilder.Entity<MaintenanceLog>()
                .HasOne(l => l.PerformedByEmployee)
                .WithMany()
                .HasForeignKey(l => l.PerformedBy)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            base.OnModelCreating(modelBuilder);
        }
    }
}