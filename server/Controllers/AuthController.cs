using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AmusementParkAPI.Data;
using AmusementParkAPI.Models;
using AmusementParkAPI.DTOs;
using BCrypt.Net;

namespace AmusementParkAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<ActionResult<LoginResponse>> Register(RegisterRequest request)
        {
            // Check if username already exists
            if (await _context.UserLogins.AnyAsync(u => u.Username == request.Username))
            {
                return BadRequest(new { message = "Username already exists" });
            }

            // Check if email already exists
            if (await _context.Customers.AnyAsync(c => c.Email == request.Email))
            {
                return BadRequest(new { message = "Email already exists" });
            }

            // Create customer
            var customer = new Customer
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Phone = request.Phone,
                DateOfBirth = request.DateOfBirth,
                CreatedAt = DateTime.Now
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            // Hash password
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Create user login
            var userLogin = new UserLogin
            {
                Username = request.Username,
                Password = hashedPassword,
                CustomerId = customer.CustomerId,
                UserType = "Customer",
                LastLogin = DateTime.Now
            };

            _context.UserLogins.Add(userLogin);
            await _context.SaveChangesAsync();

            return Ok(new LoginResponse
            {
                UserId = userLogin.UserId,
                Username = userLogin.Username,
                UserType = userLogin.UserType,
                CustomerId = customer.CustomerId,
                FirstName = customer.FirstName,
                LastName = customer.LastName,
                Email = customer.Email,
                Message = "Registration successful"
            });
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
        {
            // Find user by username
            var userLogin = await _context.UserLogins
                .Include(u => u.Customer)
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            if (userLogin == null)
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }

            // Verify password
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, userLogin.Password);

            if (!isPasswordValid)
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }

            // Update last login
            userLogin.LastLogin = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new LoginResponse
            {
                UserId = userLogin.UserId,
                Username = userLogin.Username,
                UserType = userLogin.UserType ?? "Customer",
                CustomerId = userLogin.CustomerId,
                FirstName = userLogin.Customer?.FirstName,
                LastName = userLogin.Customer?.LastName,
                Email = userLogin.Customer?.Email,
                Message = "Login successful"
            });
        }

        // GET: api/auth/profile/{customerId}
        [HttpGet("profile/{customerId}")]
        public async Task<ActionResult<Customer>> GetProfile(int customerId)
        {
            var customer = await _context.Customers.FindAsync(customerId);

            if (customer == null)
            {
                return NotFound(new { message = "Customer not found" });
            }

            return Ok(customer);
        }

        // PUT: api/auth/profile/{customerId}
        [HttpPut("profile/{customerId}")]
        public async Task<IActionResult> UpdateProfile(int customerId, UpdateProfileRequest request)
        {
            var customer = await _context.Customers.FindAsync(customerId);

            if (customer == null)
            {
                return NotFound(new { message = "Customer not found" });
            }

            // Update fields if provided
            if (!string.IsNullOrEmpty(request.FirstName))
                customer.FirstName = request.FirstName;
            
            if (!string.IsNullOrEmpty(request.LastName))
                customer.LastName = request.LastName;
            
            if (!string.IsNullOrEmpty(request.Email))
            {
                // Check if new email already exists
                if (await _context.Customers.AnyAsync(c => c.Email == request.Email && c.CustomerId != customerId))
                {
                    return BadRequest(new { message = "Email already exists" });
                }
                customer.Email = request.Email;
            }
            
            if (!string.IsNullOrEmpty(request.Phone))
                customer.Phone = request.Phone;
            
            if (request.DateOfBirth.HasValue)
                customer.DateOfBirth = request.DateOfBirth;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile updated successfully", customer });
        }
    }
}