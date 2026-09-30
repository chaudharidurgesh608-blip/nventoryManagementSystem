namespace InventoryManagement.API.Models;

public class Supplier
{
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property: One Supplier has Many Products
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
