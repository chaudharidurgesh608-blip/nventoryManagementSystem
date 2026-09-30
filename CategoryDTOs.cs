namespace InventoryManagement.API.DTOs;

public class CategoryDto
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public int ProductCount { get; set; }
}

public class CategoryCreateUpdateDto
{
    public string CategoryName { get; set; } = string.Empty;
    public string? Description { get; set; }
}
