using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using server.Data.Models;

namespace server.Data;

public partial class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Customer> Customers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_0900_ai_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.MyRowId).HasName("PRIMARY");

            entity.ToTable("customers");

            entity.Property(e => e.MyRowId).HasColumnName("my_row_id");
            entity.Property(e => e.Maker).HasMaxLength(100);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
