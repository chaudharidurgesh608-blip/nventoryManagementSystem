using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventoryManagement.API.Data;
using InventoryManagement.API.DTOs;

namespace InventoryManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/dashboard/summary
    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummary()
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Supplier)
            .ToListAsync();

        var totalCategories = await _context.Categories.CountAsync();
        var totalSuppliers = await _context.Suppliers.CountAsync();

        var totalProducts = products.Count;
        var totalStockUnits = products.Sum(p => p.Quantity);
        var lowStockCount = products.Count(p => p.Quantity <= p.MinimumStockLevel && p.Quantity > 0);
        var outOfStockCount = products.Count(p => p.Quantity == 0);
        var totalInventoryValue = products.Sum(p => p.Price * p.Quantity);

        var totalStockIn = await _context.StockTransactions.CountAsync(t => t.TransactionType == "IN");
        var totalStockOut = await _context.StockTransactions.CountAsync(t => t.TransactionType == "OUT");

        // Recent 5 transactions
        var recentTransactions = await _context.StockTransactions
            .Include(t => t.Product)
            .Include(t => t.User)
            .OrderByDescending(t => t.TransactionDate)
            .Take(5)
            .Select(t => new StockTransactionDto
            {
                TransactionId = t.TransactionId,
                ProductId = t.ProductId,
                ProductName = t.Product != null ? t.Product.ProductName : "Deleted",
                SKU = t.Product != null ? t.Product.SKU : "",
                UserId = t.UserId,
                UserName = t.User != null ? t.User.FullName : "System",
                TransactionType = t.TransactionType,
                Quantity = t.Quantity,
                TransactionDate = t.TransactionDate,
                Remarks = t.Remarks
            })
            .ToListAsync();

        // Low stock alerts list
        var lowStockAlerts = products
            .Where(p => p.Quantity <= p.MinimumStockLevel)
            .Select(p => new ProductDto
            {
                ProductId = p.ProductId,
                ProductName = p.ProductName,
                SKU = p.SKU,
                Price = p.Price,
                Quantity = p.Quantity,
                MinimumStockLevel = p.MinimumStockLevel,
                StockStatus = p.Quantity == 0 ? "Out of Stock" : "Low Stock",
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.CategoryName ?? "",
                SupplierId = p.SupplierId,
                SupplierName = p.Supplier?.SupplierName ?? ""
            })
            .ToList();

        var summary = new DashboardSummaryDto
        {
            TotalProducts = totalProducts,
            TotalCategories = totalCategories,
            TotalSuppliers = totalSuppliers,
            TotalStockUnits = totalStockUnits,
            LowStockCount = lowStockCount,
            OutOfStockCount = outOfStockCount,
            TotalInventoryValue = totalInventoryValue,
            TotalStockInTransactions = totalStockIn,
            TotalStockOutTransactions = totalStockOut,
            RecentTransactions = recentTransactions,
            LowStockAlerts = lowStockAlerts
        };

        return Ok(summary);
    }
}
