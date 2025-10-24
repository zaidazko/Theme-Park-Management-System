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
        public DbSet<Rides> Rides { get; set; }
        
        // Employee management
        public DbSet<Employee> Employees { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Role> Roles { get; set; }


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
            modelBuilder.Entity<Rides>().ToTable("ride");
            modelBuilder.Entity<Employee>().ToTable("employees");
            modelBuilder.Entity<Department>().ToTable("department");
            modelBuilder.Entity<Role>().ToTable("role");

    
            
            // Primary keys
            modelBuilder.Entity<Customer>().HasKey(c => c.CustomerId);
            modelBuilder.Entity<UserLogin>().HasKey(u => u.UserId);
            modelBuilder.Entity<TicketType>().HasKey(t => t.TicketType_ID);
            modelBuilder.Entity<TicketSale>().HasKey(t => t.Ticket_ID);
            modelBuilder.Entity<CommodityType>().HasKey(c => c.Commodity_TypeID);
            modelBuilder.Entity<CommoditySale>().HasKey(c => c.Commodity_SaleID);
            modelBuilder.Entity<Restaurant>().HasKey(r => r.Menu_ID);
            modelBuilder.Entity<Rides>().HasKey(r => r.Ride_ID);
            modelBuilder.Entity<Employee>().HasKey(e => e.EmployeeId);
            modelBuilder.Entity<Department>().HasKey(d => d.DepartmentId);
            modelBuilder.Entity<Role>().HasKey(r => r.RoleId);
            

            base.OnModelCreating(modelBuilder);
        }
    }
}