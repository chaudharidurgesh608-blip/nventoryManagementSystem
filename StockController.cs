using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventoryManagement.API.Data;
using InventoryManagement.API.DTOs;
using InventoryManagement.API.Models;

namespace InventoryManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StockController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public StockController(ApplicationDbContext context)
    {
        _context = context;
    }

    // POST: api/stock/in
    [HttpPost("in")]
    public async Task<ActionResult<StockAdjustmentResponseDto>> StockIn([FromBody] StockAdjustmentDto dto)
    {
        if (dto.Quantity <= 0)
            return BadRequest(new { message = "Quantity must be greater than zero." });

        var product = await _context.Products.FindAsync(dto.ProductId);
        if (product == null)
            return NotFound(new { message = $"Product with ID {dto.ProductId} not found." });

        var previousQty = product.Quantity;
        product.Quantity += dto.Quantity;
        product.UpdatedAt = DateTime.UtcNow;

        // Get current user ID if authenticated
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Record Transaction
        var transaction = new StockTransaction
        {
            ProductId = product.ProductId,
            UserId = userId,
            TransactionType = "IN",
            Quantity = dto.Quantity,
            TransactionDate = DateTime.UtcNow,
            Remarks = string.IsNullOrWhiteSpace(dto.Remarks) ? "Stock received" : dto.Remarks.Trim()
        };

        _context.StockTransactions.Add(transaction);
        await _context.SaveChangesAsync();

        return Ok(new StockAdjustmentResponseDto
        {
            IsSuccess = true,
            Message = $"Successfully added {dto.Quantity} units to stock.",
            ProductId = product.ProductId,
            ProductName = product.ProductName,
            PreviousQuantity = previousQty,
            NewQuantity = product.Quantity,
            TransactionType = "IN"
        });
    }

    // POST: api/stock/out
    [HttpPost("out")]
    public async Task<ActionResult<StockAdjustmentResponseDto>> StockOut([FromBody] StockAdjustmentDto dto)
    {
        if (dto.Quantity <= 0)
            return BadRequest(new { message = "Quantity must be greater than zero." });

        var product = await _context.Products.FindAsync(dto.ProductId);
        if (product == null)
            return NotFound(new { message = $"Product with ID {dto.ProductId} not found." });

        // CRITICAL CHECK: Prevent negative inventory!
        if (product.Quantity < dto.Quantity)
        {
            return BadRequest(new
            {
                message = $"Insufficient stock! Available quantity is only {product.Quantity}, but you requested {dto.Quantity}."
            });
        }

        var previousQty = product.Quantity;
        product.Quantity -= dto.Quantity;
        product.UpdatedAt = DateTime.UtcNow;

        // Get current user ID if authenticated
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Record Transaction
        var transaction = new StockTransaction
        {
            ProductId = product.ProductId,
            UserId = userId,
            TransactionType = "OUT",
            Quantity = dto.Quantity,
            TransactionDate = DateTime.UtcNow,
            Remarks = string.IsNullOrWhiteSpace(dto.Remarks) ? "Stock issued/sold" : dto.Remarks.Trim()
        };

        _context.StockTransactions.Add(transaction);
        await _context.SaveChangesAsync();

        return Ok(new StockAdjustmentResponseDto
        {
            IsSuccess = true,
            Message = $"Successfully removed {dto.Quantity} units from stock.",
            ProductId = product.ProductId,
            ProductName = product.ProductName,
            PreviousQuantity = previousQty,
            NewQuantity = product.Quantity,
            TransactionType = "OUT"
        });
    }
}
