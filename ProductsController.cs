using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventoryManagement.API.Data;
using InventoryManagement.API.DTOs;
using InventoryManagement.API.Models;

namespace InventoryManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProductsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/products?search=lap&categoryId=1&supplierId=1&status=lowstock
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts(
        [FromQuery] string? search,
        [FromQuery] int? categoryId,
        [FromQuery] int? supplierId,
        [FromQuery] string? status)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Supplier)
            .AsQueryable();

        // 1. Search Filter (by Product Name or SKU)
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(p => p.ProductName.ToLower().Contains(s) || p.SKU.ToLower().Contains(s));
        }

        // 2. Category Filter
        if (categoryId.HasValue && categoryId.Value > 0)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        // 3. Supplier Filter
        if (supplierId.HasValue && supplierId.Value > 0)
        {
            query = query.Where(p => p.SupplierId == supplierId.Value);
        }

        var products = await query.ToListAsync();

        // 4. Map to DTO and Calculate Stock Status
        var productDtos = products.Select(p => new ProductDto
        {
            ProductId = p.ProductId,
            ProductName = p.ProductName,
            SKU = p.SKU,
            Description = p.Description,
            Price = p.Price,
            Quantity = p.Quantity,
            MinimumStockLevel = p.MinimumStockLevel,
            StockStatus = CalculateStockStatus(p.Quantity, p.MinimumStockLevel),
            CategoryId = p.CategoryId,
            CategoryName = p.Category?.CategoryName ?? "Uncategorized",
            SupplierId = p.SupplierId,
            SupplierName = p.Supplier?.SupplierName ?? "Unknown",
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt
        }).ToList();

        // 5. Status Filter ("instock", "lowstock", "outofstock")
        if (!string.IsNullOrWhiteSpace(status))
        {
            var st = status.Trim().ToLower();
            if (st == "outofstock")
                productDtos = productDtos.Where(p => p.StockStatus == "Out of Stock").ToList();
            else if (st == "lowstock")
                productDtos = productDtos.Where(p => p.StockStatus == "Low Stock").ToList();
            else if (st == "instock")
                productDtos = productDtos.Where(p => p.StockStatus == "In Stock").ToList();
        }

        return Ok(productDtos);
    }

    // GET: api/products/5
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Supplier)
            .FirstOrDefaultAsync(p => p.ProductId == id);

        if (product == null)
            return NotFound(new { message = $"Product with ID {id} not found." });

        return Ok(new ProductDto
        {
            ProductId = product.ProductId,
            ProductName = product.ProductName,
            SKU = product.SKU,
            Description = product.Description,
            Price = product.Price,
            Quantity = product.Quantity,
            MinimumStockLevel = product.MinimumStockLevel,
            StockStatus = CalculateStockStatus(product.Quantity, product.MinimumStockLevel),
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.CategoryName ?? "Uncategorized",
            SupplierId = product.SupplierId,
            SupplierName = product.Supplier?.SupplierName ?? "Unknown",
            CreatedAt = product.CreatedAt,
            UpdatedAt = product.UpdatedAt
        });
    }

    // POST: api/products
    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] ProductCreateUpdateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.ProductName) || string.IsNullOrWhiteSpace(dto.SKU))
            return BadRequest(new { message = "Product name and SKU are required." });

        if (dto.Price < 0)
            return BadRequest(new { message = "Price cannot be negative." });

        if (dto.Quantity < 0)
            return BadRequest(new { message = "Quantity cannot be negative." });

        // Check if Category exists
        var categoryExists = await _context.Categories.AnyAsync(c => c.CategoryId == dto.CategoryId);
        if (!categoryExists)
            return BadRequest(new { message = $"Category ID {dto.CategoryId} does not exist." });

        // Check if Supplier exists
        var supplierExists = await _context.Suppliers.AnyAsync(s => s.SupplierId == dto.SupplierId);
        if (!supplierExists)
            return BadRequest(new { message = $"Supplier ID {dto.SupplierId} does not exist." });

        // Check Unique SKU
        var skuExists = await _context.Products.AnyAsync(p => p.SKU.ToLower() == dto.SKU.Trim().ToLower());
        if (skuExists)
            return BadRequest(new { message = "A product with this SKU already exists. SKU must be unique." });

        var product = new Product
        {
            ProductName = dto.ProductName.Trim(),
            SKU = dto.SKU.Trim().ToUpper(),
            Description = dto.Description,
            Price = dto.Price,
            Quantity = dto.Quantity,
            MinimumStockLevel = dto.MinimumStockLevel < 0 ? 5 : dto.MinimumStockLevel,
            CategoryId = dto.CategoryId,
            SupplierId = dto.SupplierId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        // Fetch category and supplier names for return
        var category = await _context.Categories.FindAsync(product.CategoryId);
        var supplier = await _context.Suppliers.FindAsync(product.SupplierId);

        var result = new ProductDto
        {
            ProductId = product.ProductId,
            ProductName = product.ProductName,
            SKU = product.SKU,
            Description = product.Description,
            Price = product.Price,
            Quantity = product.Quantity,
            MinimumStockLevel = product.MinimumStockLevel,
            StockStatus = CalculateStockStatus(product.Quantity, product.MinimumStockLevel),
            CategoryId = product.CategoryId,
            CategoryName = category?.CategoryName ?? "",
            SupplierId = product.SupplierId,
            SupplierName = supplier?.SupplierName ?? "",
            CreatedAt = product.CreatedAt
        };

        return CreatedAtAction(nameof(GetProduct), new { id = product.ProductId }, result);
    }

    // PUT: api/products/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(int id, [FromBody] ProductCreateUpdateDto dto)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
            return NotFound(new { message = $"Product with ID {id} not found." });

        if (string.IsNullOrWhiteSpace(dto.ProductName) || string.IsNullOrWhiteSpace(dto.SKU))
            return BadRequest(new { message = "Product name and SKU are required." });

        // Check Unique SKU with other products
        var duplicateSku = await _context.Products
            .AnyAsync(p => p.ProductId != id && p.SKU.ToLower() == dto.SKU.Trim().ToLower());
        if (duplicateSku)
            return BadRequest(new { message = "Another product with this SKU already exists." });

        // Check Category & Supplier
        if (!await _context.Categories.AnyAsync(c => c.CategoryId == dto.CategoryId))
            return BadRequest(new { message = $"Category ID {dto.CategoryId} does not exist." });

        if (!await _context.Suppliers.AnyAsync(s => s.SupplierId == dto.SupplierId))
            return BadRequest(new { message = $"Supplier ID {dto.SupplierId} does not exist." });

        product.ProductName = dto.ProductName.Trim();
        product.SKU = dto.SKU.Trim().ToUpper();
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.Quantity = dto.Quantity;
        product.MinimumStockLevel = dto.MinimumStockLevel;
        product.CategoryId = dto.CategoryId;
        product.SupplierId = dto.SupplierId;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Product updated successfully." });
    }

    // DELETE: api/products/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
            return NotFound(new { message = $"Product with ID {id} not found." });

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Product deleted successfully." });
    }

    private static string CalculateStockStatus(int quantity, int minStock)
    {
        if (quantity == 0)
            return "Out of Stock";
        if (quantity <= minStock)
            return "Low Stock";
        return "In Stock";
    }
}
