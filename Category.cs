namespace InventoryManagement.API.Models;

public class Category
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property: One Category has Many Products
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
