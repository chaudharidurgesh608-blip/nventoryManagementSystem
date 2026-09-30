namespace InventoryManagement.API.Models;

public class Product
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public int MinimumStockLevel { get; set; } = 5;

    // Foreign Key for Category
    public int CategoryId { get; set; }
    public Category? Category { get; set; }

    // Foreign Key for Supplier
    public int SupplierId { get; set; }
    public Supplier? Supplier { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigation property: One Product has Many Stock Transactions
    public ICollection<StockTransaction> StockTransactions { get; set; } = new List<StockTransaction>();
}
