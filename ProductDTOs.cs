namespace InventoryManagement.API.DTOs;

public class ProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public int MinimumStockLevel { get; set; }
    public string StockStatus { get; set; } = "In Stock"; // "In Stock", "Low Stock", "Out of Stock"
    
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    
    public int SupplierId { get; set; }
    public string SupplierName { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class ProductCreateUpdateDto
{
    public string ProductName { get; set; } = string.Empty;
    public string SKU { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public int MinimumStockLevel { get; set; } = 5;
    public int CategoryId { get; set; }
    public int SupplierId { get; set; }
}
