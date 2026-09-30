namespace InventoryManagement.API.Models;

public class StockTransaction
{
    public int TransactionId { get; set; }

    // Foreign Key for Product
    public int ProductId { get; set; }
    public Product? Product { get; set; }

    // Foreign Key for User who made the transaction
    public string? UserId { get; set; }
    public ApplicationUser? User { get; set; }

    public string TransactionType { get; set; } = string.Empty; // "IN" or "OUT"
    public int Quantity { get; set; }
    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
    public string? Remarks { get; set; }
}
