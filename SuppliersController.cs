using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventoryManagement.API.Data;
using InventoryManagement.API.DTOs;
using InventoryManagement.API.Models;

namespace InventoryManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SuppliersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SuppliersController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/suppliers
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SupplierDto>>> GetSuppliers()
    {
        var suppliers = await _context.Suppliers
            .Select(s => new SupplierDto
            {
                SupplierId = s.SupplierId,
                SupplierName = s.SupplierName,
                Phone = s.Phone,
                Email = s.Email,
                Address = s.Address,
                CreatedAt = s.CreatedAt,
                ProductCount = s.Products.Count
            })
            .ToListAsync();

        return Ok(suppliers);
    }

    // GET: api/suppliers/5
    [HttpGet("{id}")]
    public async Task<ActionResult<SupplierDto>> GetSupplier(int id)
    {
        var supplier = await _context.Suppliers
            .Where(s => s.SupplierId == id)
            .Select(s => new SupplierDto
            {
                SupplierId = s.SupplierId,
                SupplierName = s.SupplierName,
                Phone = s.Phone,
                Email = s.Email,
                Address = s.Address,
                CreatedAt = s.CreatedAt,
                ProductCount = s.Products.Count
            })
            .FirstOrDefaultAsync();

        if (supplier == null)
            return NotFound(new { message = $"Supplier with ID {id} not found." });

        return Ok(supplier);
    }

    // POST: api/suppliers
    [HttpPost]
    public async Task<ActionResult<SupplierDto>> CreateSupplier([FromBody] SupplierCreateUpdateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.SupplierName))
            return BadRequest(new { message = "Supplier name is required." });

        var exists = await _context.Suppliers
            .AnyAsync(s => s.SupplierName.ToLower() == dto.SupplierName.Trim().ToLower());

        if (exists)
            return BadRequest(new { message = "A supplier with this name already exists." });

        var supplier = new Supplier
        {
            SupplierName = dto.SupplierName.Trim(),
            Phone = dto.Phone,
            Email = dto.Email,
            Address = dto.Address,
            CreatedAt = DateTime.UtcNow
        };

        _context.Suppliers.Add(supplier);
        await _context.SaveChangesAsync();

        var result = new SupplierDto
        {
            SupplierId = supplier.SupplierId,
            SupplierName = supplier.SupplierName,
            Phone = supplier.Phone,
            Email = supplier.Email,
            Address = supplier.Address,
            CreatedAt = supplier.CreatedAt,
            ProductCount = 0
        };

        return CreatedAtAction(nameof(GetSupplier), new { id = supplier.SupplierId }, result);
    }

    // PUT: api/suppliers/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSupplier(int id, [FromBody] SupplierCreateUpdateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.SupplierName))
            return BadRequest(new { message = "Supplier name is required." });

        var supplier = await _context.Suppliers.FindAsync(id);
        if (supplier == null)
            return NotFound(new { message = $"Supplier with ID {id} not found." });

        var duplicateExists = await _context.Suppliers
            .AnyAsync(s => s.SupplierId != id && s.SupplierName.ToLower() == dto.SupplierName.Trim().ToLower());

        if (duplicateExists)
            return BadRequest(new { message = "Another supplier with this name already exists." });

        supplier.SupplierName = dto.SupplierName.Trim();
        supplier.Phone = dto.Phone;
        supplier.Email = dto.Email;
        supplier.Address = dto.Address;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Supplier updated successfully." });
    }

    // DELETE: api/suppliers/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSupplier(int id)
    {
        var supplier = await _context.Suppliers
            .Include(s => s.Products)
            .FirstOrDefaultAsync(s => s.SupplierId == id);

        if (supplier == null)
            return NotFound(new { message = $"Supplier with ID {id} not found." });

        if (supplier.Products.Any())
            return BadRequest(new { message = "Cannot delete supplier because products are linked to it. Remove linked products first." });

        _context.Suppliers.Remove(supplier);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Supplier deleted successfully." });
    }
}
