using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AmusementParkAPI.Data;
using AmusementParkAPI.Models;

namespace AmusementParkAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EmployeeController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/employee
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Employee>>> GetEmployees()
        {
            return await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Role)
                .ToListAsync();
        }

        // GET: api/employee/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Employee>> GetEmployee(int id)
        {
            var employee = await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.Role)
                .FirstOrDefaultAsync(e => e.EmployeeId == id);

            if (employee == null)
            {
                return NotFound();
            }
            return employee;
        }

        // POST: api/employee
        [HttpPost]
        public async Task<ActionResult<Employee>> PostEmployee(Employee employee)
        {
            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetEmployee", new { id = employee.EmployeeId }, employee);
        }

        // PUT: api/employee/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEmployee(int id, Employee employee)
        {
            if (id != employee.EmployeeId)
            {
                return BadRequest();
            }

            var existingEmployee = await _context.Employees.FindAsync(id);
            if (existingEmployee == null)
            {
                return NotFound();
            }

            // Update only the fields that are provided
            if (!string.IsNullOrEmpty(employee.FirstName))
                existingEmployee.FirstName = employee.FirstName;
            if (!string.IsNullOrEmpty(employee.LastName))
                existingEmployee.LastName = employee.LastName;
            if (!string.IsNullOrEmpty(employee.Email))
                existingEmployee.Email = employee.Email;
            if (!string.IsNullOrEmpty(employee.Phone))
                existingEmployee.Phone = employee.Phone;
            if (employee.HireDate.HasValue)
                existingEmployee.HireDate = employee.HireDate;
            if (employee.Salary.HasValue)
                existingEmployee.Salary = employee.Salary;
            if (employee.DepartmentId.HasValue)
                existingEmployee.DepartmentId = employee.DepartmentId;
            if (employee.RoleId.HasValue)
                existingEmployee.RoleId = employee.RoleId;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/employee/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return NotFound();
            }

            // Find and remove the associated user login account
            var userLogin = await _context.UserLogins
                .FirstOrDefaultAsync(u => u.EmployeeId == id);
            
            if (userLogin != null)
            {
                _context.UserLogins.Remove(userLogin);
            }

            // Remove the employee record
            _context.Employees.Remove(employee);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
