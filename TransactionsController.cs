using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventoryManagement.API.Data;
using InventoryManagement.API.DTOs;

namespace InventoryManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TransactionsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/transactions?productId=1&type=IN
    [HttpGet]
    public async Task<ActionResult<IEnumerable<StockTransactionDto>>> GetTransactions(
        [FromQuery] int? productId,
        [FromQuery] string? type,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate)
    {
        var query = _context.StockTransactions
            .Include(t => t.Product)
            .Include(t => t.User)
            .AsQueryable();

        if (productId.HasValue && productId.Value > 0)
        {
            query = query.Where(t => t.ProductId == productId.Value);
        }

        if (!string.IsNullOrWhiteSpace(type))
        {
            query = query.Where(t => t.TransactionType.ToUpper() == type.Trim().ToUpper());
        }

        if (fromDate.HasValue)
        {
            query = query.Where(t => t.TransactionDate >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(t => t.TransactionDate <= toDate.Value);
        }

        var transactions = await query
            .OrderByDescending(t => t.TransactionDate)
            .Select(t => new StockTransactionDto
            {
                TransactionId = t.TransactionId,
                ProductId = t.ProductId,
                ProductName = t.Product != null ? t.Product.ProductName : "Deleted Product",
                SKU = t.Product != null ? t.Product.SKU : "",
                UserId = t.UserId,
                UserName = t.User != null ? t.User.FullName : "System",
                TransactionType = t.TransactionType,
                Quantity = t.Quantity,
                TransactionDate = t.TransactionDate,
                Remarks = t.Remarks
            })
            .ToListAsync();

        return Ok(transactions);
    }
}
