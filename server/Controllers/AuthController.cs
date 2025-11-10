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

        // POST: api/auth/register-employee
        [HttpPost("register-employee")]
        public async Task<ActionResult<LoginResponse>> RegisterEmployee(RegisterEmployeeRequest request)
        {
            // Check if username already exists
            if (await _context.UserLogins.AnyAsync(u => u.Username == request.Username))
            {
                return BadRequest(new { message = "Username already exists" });
            }

            // Check if email already exists in customers or employees
            if (await _context.Customers.AnyAsync(c => c.Email == request.Email) ||
                await _context.Employees.AnyAsync(e => e.Email == request.Email))
            {
                return BadRequest(new { message = "Email already exists" });
            }

            // Create employee
            var employee = new Employee
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                Email = request.Email,
                Phone = request.Phone,
                HireDate = request.HireDate,
                Salary = request.Salary,
                DepartmentId = request.DepartmentId,
                RoleId = request.RoleId
            };

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            // Hash password
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            // Create user login
            var userLogin = new UserLogin
            {
                Username = request.Username,
                Password = hashedPassword,
                EmployeeId = employee.EmployeeId, // Use EmployeeId for employee accounts
                CustomerId = null, // Explicitly set CustomerId to null for employees
                UserType = "Employee",
                LastLogin = DateTime.Now
            };

            _context.UserLogins.Add(userLogin);
            await _context.SaveChangesAsync();

            // Fetch role info (if any)
            int? roleId = employee.RoleId;
            string? roleName = null;
            if (roleId.HasValue)
            {
                var role = await _context.Roles.FindAsync(roleId.Value);
                roleName = role?.RoleName;
            }

            return Ok(new LoginResponse
            {
                UserId = userLogin.UserId,
                Username = userLogin.Username,
                UserType = userLogin.UserType,
                CustomerId = null,
                EmployeeId = employee.EmployeeId,
                FirstName = employee.FirstName,
                LastName = employee.LastName,
                Email = employee.Email,
                RoleId = roleId,
                RoleName = roleName,
                Message = "Employee registration successful"
            });
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
        {
            // Find user by username
            var userLogin = await _context.UserLogins
                .Include(u => u.Customer)
                .Include(u => u.Employee)
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

            // Determine if this is a Customer or Employee and set appropriate IDs
            var customerId = userLogin.UserType == "Employee" ? null : userLogin.CustomerId;
            var employeeId = userLogin.UserType == "Employee" ? userLogin.EmployeeId : null;
            var firstName = userLogin.UserType == "Employee" ? userLogin.Employee?.FirstName : userLogin.Customer?.FirstName;
            var lastName = userLogin.UserType == "Employee" ? userLogin.Employee?.LastName : userLogin.Customer?.LastName;
            var email = userLogin.UserType == "Employee" ? userLogin.Employee?.Email : userLogin.Customer?.Email;

            // Attempt to include role info for employees
            int? roleId = null;
            string? roleName = null;
            if (userLogin.UserType == "Employee" && userLogin.Employee != null)
            {
                roleId = userLogin.Employee.RoleId;
                if (roleId.HasValue)
                {
                    var role = await _context.Roles.FindAsync(roleId.Value);
                    roleName = role?.RoleName;
                }
            }

            return Ok(new LoginResponse
            {
                UserId = userLogin.UserId,
                Username = userLogin.Username,
                UserType = userLogin.UserType ?? "Customer",
                CustomerId = customerId,
                EmployeeId = employeeId,
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                RoleId = roleId,
                RoleName = roleName,
                Message = "Login successful"
            });
        }

        // GET: api/auth/employee-login/{employeeId}
        [HttpGet("employee-login/{employeeId}")]
        public async Task<ActionResult> GetEmployeeLogin(int employeeId)
        {
            var userLogin = await _context.UserLogins
                .Where(u => u.EmployeeId == employeeId)
                .Select(u => new { u.Username })
                .FirstOrDefaultAsync();

            if (userLogin == null)
            {
                return NotFound(new { message = "User login not found" });
            }

            return Ok(userLogin);
        }

        // GET: api/auth/customer-login/{customerId}
        [HttpGet("customer-login/{customerId}")]
        public async Task<ActionResult> GetCustomerLogin(int customerId)
        {
            var userLogin = await _context.UserLogins
                .Where(u => u.CustomerId == customerId)
                .Select(u => new { u.Username })
                .FirstOrDefaultAsync();

            if (userLogin == null)
            {
                return NotFound(new { message = "User login not found" });
            }

            return Ok(userLogin);
        }

        // GET: api/auth/profile/{userId}
        [HttpGet("profile/{userId}")]
        public async Task<ActionResult> GetProfile(int userId, string userType = "Customer")
        {
            if (userType == "Employee")
            {
                var employee = await _context.Employees.FindAsync(userId);
                if (employee == null)
                {
                    return NotFound(new { message = "Employee not found" });
                }
                return Ok(employee);
            }
            else
            {
                var customer = await _context.Customers.FindAsync(userId);
                if (customer == null)
                {
                    return NotFound(new { message = "Customer not found" });
                }
                return Ok(customer);
            }
        }

        // PUT: api/auth/profile/{userId}
        [HttpPut("profile/{userId}")]
        public async Task<IActionResult> UpdateProfile(int userId, UpdateProfileRequest request, string userType = "Customer")
        {
            // First, ensure the target user exists (employee or customer)
            Employee? employee = null;
            Customer? customer = null;

            if (userType == "Employee")
            {
                employee = await _context.Employees.FindAsync(userId);
                if (employee == null)
                {
                    return NotFound(new { message = "Employee not found" });
                }
            }
            else
            {
                customer = await _context.Customers.FindAsync(userId);
                if (customer == null)
                {
                    return NotFound(new { message = "Customer not found" });
                }
            }

            // If username or password update requested, find the user login row
            UserLogin? userLogin = null;
            if (!string.IsNullOrEmpty(request.Username) || !string.IsNullOrEmpty(request.Password))
            {
                userLogin = await _context.UserLogins.FirstOrDefaultAsync(u => 
                    (userType == "Employee" && u.EmployeeId == userId) || 
                    (userType == "Customer" && u.CustomerId == userId));

                if (userLogin == null)
                {
                    return NotFound(new { message = "User login not found" });
                }

                // Check if new username already exists
                if (!string.IsNullOrEmpty(request.Username) &&
                    await _context.UserLogins.AnyAsync(u => u.Username == request.Username && u.UserId != userLogin.UserId))
                {
                    return BadRequest(new { message = "Username already exists", field = "username" });
                }

                if (!string.IsNullOrEmpty(request.Username))
                {
                    userLogin.Username = request.Username;
                }

                if (!string.IsNullOrEmpty(request.Password))
                {
                    // Hash and update password
                    userLogin.Password = BCrypt.Net.BCrypt.HashPassword(request.Password);
                }
            }

            // Update profile fields for employee or customer
            if (employee != null)
            {
                if (!string.IsNullOrEmpty(request.FirstName))
                    employee.FirstName = request.FirstName;

                if (!string.IsNullOrEmpty(request.LastName))
                    employee.LastName = request.LastName;

                if (!string.IsNullOrEmpty(request.Email))
                {
                    // Check if new email already exists
                    if (await _context.Employees.AnyAsync(e => e.Email == request.Email && e.EmployeeId != userId))
                    {
                        return BadRequest(new { message = "Email already exists", field = "email" });
                    }
                    employee.Email = request.Email;
                }

                if (!string.IsNullOrEmpty(request.Phone))
                    employee.Phone = request.Phone;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Employee profile updated successfully", employee });
            }

            // customer branch
            if (customer != null)
            {
                if (!string.IsNullOrEmpty(request.FirstName))
                    customer.FirstName = request.FirstName;

                if (!string.IsNullOrEmpty(request.LastName))
                    customer.LastName = request.LastName;

                if (!string.IsNullOrEmpty(request.Email))
                {
                    // Check if new email already exists
                    if (await _context.Customers.AnyAsync(c => c.Email == request.Email && c.CustomerId != userId))
                    {
                        return BadRequest(new { message = "Email already exists", field = "email" });
                    }
                    customer.Email = request.Email;
                }

                if (!string.IsNullOrEmpty(request.Phone))
                    customer.Phone = request.Phone;

                if (request.DateOfBirth.HasValue)
                    customer.DateOfBirth = request.DateOfBirth;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Customer profile updated successfully", customer });
            }

            // Fallback - should not reach here
            return BadRequest(new { message = "No updates applied" });
        }
    }
}