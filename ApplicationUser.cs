using Microsoft.AspNetCore.Identity;

namespace InventoryManagement.API.Models;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property: One User has Many Stock Transactions
    public ICollection<StockTransaction> StockTransactions { get; set; } = new List<StockTransaction>();
}
