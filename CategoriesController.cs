using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using InventoryManagement.API.Data;
using InventoryManagement.API.DTOs;
using InventoryManagement.API.Models;

namespace InventoryManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CategoriesController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/categories
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
    {
        var categories = await _context.Categories
            .Select(c => new CategoryDto
            {
                CategoryId = c.CategoryId,
                CategoryName = c.CategoryName,
                Description = c.Description,
                CreatedAt = c.CreatedAt,
                ProductCount = c.Products.Count
            })
            .ToListAsync();

        return Ok(categories);
    }

    // GET: api/categories/5
    [HttpGet("{id}")]
    public async Task<ActionResult<CategoryDto>> GetCategory(int id)
    {
        var category = await _context.Categories
            .Where(c => c.CategoryId == id)
            .Select(c => new CategoryDto
            {
                CategoryId = c.CategoryId,
                CategoryName = c.CategoryName,
                Description = c.Description,
                CreatedAt = c.CreatedAt,
                ProductCount = c.Products.Count
            })
            .FirstOrDefaultAsync();

        if (category == null)
            return NotFound(new { message = $"Category with ID {id} not found." });

        return Ok(category);
    }

    // POST: api/categories
    [HttpPost]
    public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CategoryCreateUpdateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.CategoryName))
            return BadRequest(new { message = "Category name is required." });

        // Check duplicate name
        var exists = await _context.Categories
            .AnyAsync(c => c.CategoryName.ToLower() == dto.CategoryName.Trim().ToLower());

        if (exists)
            return BadRequest(new { message = "A category with this name already exists." });

        var category = new Category
        {
            CategoryName = dto.CategoryName.Trim(),
            Description = dto.Description,
            CreatedAt = DateTime.UtcNow
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        var result = new CategoryDto
        {
            CategoryId = category.CategoryId,
            CategoryName = category.CategoryName,
            Description = category.Description,
            CreatedAt = category.CreatedAt,
            ProductCount = 0
        };

        return CreatedAtAction(nameof(GetCategory), new { id = category.CategoryId }, result);
    }

    // PUT: api/categories/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(int id, [FromBody] CategoryCreateUpdateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.CategoryName))
            return BadRequest(new { message = "Category name is required." });

        var category = await _context.Categories.FindAsync(id);
        if (category == null)
            return NotFound(new { message = $"Category with ID {id} not found." });

        // Check duplicate name with other categories
        var duplicateExists = await _context.Categories
            .AnyAsync(c => c.CategoryId != id && c.CategoryName.ToLower() == dto.CategoryName.Trim().ToLower());

        if (duplicateExists)
            return BadRequest(new { message = "Another category with this name already exists." });

        category.CategoryName = dto.CategoryName.Trim();
        category.Description = dto.Description;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Category updated successfully." });
    }

    // DELETE: api/categories/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _context.Categories
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.CategoryId == id);

        if (category == null)
            return NotFound(new { message = $"Category with ID {id} not found." });

        if (category.Products.Any())
            return BadRequest(new { message = "Cannot delete category because it contains products. Move or delete products first." });

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Category deleted successfully." });
    }
}
