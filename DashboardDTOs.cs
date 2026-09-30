namespace InventoryManagement.API.DTOs;

public class DashboardSummaryDto
{
    public int TotalProducts { get; set; }
    public int TotalCategories { get; set; }
    public int TotalSuppliers { get; set; }
    public int TotalStockUnits { get; set; }
    public int LowStockCount { get; set; }
    public int OutOfStockCount { get; set; }
    public decimal TotalInventoryValue { get; set; }
    
    public int TotalStockInTransactions { get; set; }
    public int TotalStockOutTransactions { get; set; }

    public List<StockTransactionDto> RecentTransactions { get; set; } = new();
    public List<ProductDto> LowStockAlerts { get; set; } = new();
}

public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
    public DateTime CreatedAt { get; set; }
}
