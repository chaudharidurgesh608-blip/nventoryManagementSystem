using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using InventoryManagement.API.Models;

namespace InventoryManagement.API.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // Tables in Database
    public DbSet<Category> Categories { get; set; }
    public DbSet<Supplier> Suppliers { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<StockTransaction> StockTransactions { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Primary Key for StockTransaction
        builder.Entity<StockTransaction>().HasKey(t => t.TransactionId);

        // Price precision: 18 digits total, 2 decimal places (e.g. 9999999999999999.99)
        builder.Entity<Product>()
            .Property(p => p.Price)
            .HasPrecision(18, 2);

        // SKU must be unique across all products
        builder.Entity<Product>()
            .HasIndex(p => p.SKU)
            .IsUnique();

        // Relationship: Category -> Products (1 to Many)
        builder.Entity<Product>()
            .HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relationship: Supplier -> Products (1 to Many)
        builder.Entity<Product>()
            .HasOne(p => p.Supplier)
            .WithMany(s => s.Products)
            .HasForeignKey(p => p.SupplierId)
            .OnDelete(DeleteBehavior.Restrict);

        // Relationship: Product -> StockTransactions (1 to Many)
        builder.Entity<StockTransaction>()
            .HasOne(t => t.Product)
            .WithMany(p => p.StockTransactions)
            .HasForeignKey(t => t.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        // Relationship: User -> StockTransactions (1 to Many)
        builder.Entity<StockTransaction>()
            .HasOne(t => t.User)
            .WithMany(u => u.StockTransactions)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
