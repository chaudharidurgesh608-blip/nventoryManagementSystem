using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using InventoryManagement.API.DTOs;
using InventoryManagement.API.Models;

namespace InventoryManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IConfiguration _configuration;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _configuration = configuration;
    }

    // POST: api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto model)
    {
        if (model == null || string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.Password))
            return BadRequest(new AuthResponseDto { IsSuccess = false, Message = "Email and Password are required." });

        var existingUser = await _userManager.FindByEmailAsync(model.Email);
        if (existingUser != null)
            return BadRequest(new AuthResponseDto { IsSuccess = false, Message = "Email is already registered." });

        var user = new ApplicationUser
        {
            UserName = model.Email,
            Email = model.Email,
            FullName = model.FullName,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, model.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return BadRequest(new AuthResponseDto { IsSuccess = false, Message = errors });
        }

        // Assign Role (Default to "User" if not specified or invalid)
        var requestedRole = string.Equals(model.Role, "Admin", StringComparison.OrdinalIgnoreCase) ? "Admin" : "User";
        if (await _roleManager.RoleExistsAsync(requestedRole))
        {
            await _userManager.AddToRoleAsync(user, requestedRole);
        }

        return Ok(new AuthResponseDto
        {
            IsSuccess = true,
            Message = "User registered successfully!",
            Email = user.Email,
            FullName = user.FullName,
            Role = requestedRole
        });
    }

    // POST: api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto model)
    {
        if (model == null || string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.Password))
            return BadRequest(new AuthResponseDto { IsSuccess = false, Message = "Email and Password are required." });

        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, model.Password))
            return Unauthorized(new AuthResponseDto { IsSuccess = false, Message = "Invalid email or password." });

        var roles = await _userManager.GetRolesAsync(user);
        var primaryRole = roles.FirstOrDefault() ?? "User";

        // Generate JWT Token
        var token = GenerateJwtToken(user, primaryRole);

        return Ok(new AuthResponseDto
        {
            IsSuccess = true,
            Message = "Login successful!",
            Token = token,
            Email = user.Email,
            FullName = user.FullName,
            Role = primaryRole
        });
    }

    // GET: api/auth/me (Protected - gets logged in user's profile)
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var email = User.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrEmpty(email))
            return Unauthorized();

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
            return NotFound("User not found.");

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new
        {
            user.Id,
            user.FullName,
            user.Email,
            Role = roles.FirstOrDefault() ?? "User",
            user.CreatedAt
        });
    }

    private string GenerateJwtToken(ApplicationUser user, string role)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? "DefaultSuperSecretKeyForInventoryManagementSystem2026!";
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? "InventoryManagementAPI";
        var jwtAudience = _configuration["Jwt:Audience"] ?? "InventoryManagementAPI";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email ?? ""),
            new Claim(ClaimTypes.Name, user.FullName ?? ""),
            new Claim(ClaimTypes.Role, role)
        };

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7), // Token valid for 7 days
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
