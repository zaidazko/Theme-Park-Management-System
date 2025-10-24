using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AmusementParkAPI.Data;
using AmusementParkAPI.Models;
using AmusementParkAPI.DTOs;

namespace AmusementParkAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MaintenanceRequestController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MaintenanceRequestController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/maintenancerequest
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MaintenanceRequest>>> GetMaintenanceRequests()
        {
            return await _context.MaintenanceRequests
                .Include(m => m.Ride)
                .Include(m => m.Reporter)
                .Include(m => m.Assignee)
                .ToListAsync();
        }

        // GET: api/maintenancerequest/5
        [HttpGet("{id}")]
        public async Task<ActionResult<MaintenanceRequest>> GetMaintenanceRequest(int id)
        {
            var maintenanceRequest = await _context.MaintenanceRequests
                .Include(m => m.Ride)
                .Include(m => m.Reporter)
                .Include(m => m.Assignee)
                .FirstOrDefaultAsync(m => m.RequestId == id);

            if (maintenanceRequest == null)
            {
                return NotFound();
            }

            return maintenanceRequest;
        }

        // POST: api/maintenancerequest
        [HttpPost]
        public async Task<ActionResult<MaintenanceRequest>> CreateMaintenanceRequest(CreateMaintenanceRequestRequest request)
        {
            // Verify that the ride exists
            var ride = await _context.Rides.FindAsync(request.RideId);
            if (ride == null)
            {
                return BadRequest(new { message = "Ride not found" });
            }

            // Verify that the reporter exists (employee)
            var reporter = await _context.Employees.FindAsync(request.ReportedBy);
            if (reporter == null)
            {
                return BadRequest(new { message = "Reporter not found" });
            }

            var maintenanceRequest = new MaintenanceRequest
            {
                RideId = request.RideId,
                ReportedBy = request.ReportedBy,
                AssignedTo = null, // Will be null initially
                IssueDescription = request.IssueDescription,
                RequestDate = DateTime.Now,
                Status = "Open",
                CompletionDate = null // Will be null initially
            };

            _context.MaintenanceRequests.Add(maintenanceRequest);
            await _context.SaveChangesAsync();

            // Load the created request with related data
            var createdRequest = await _context.MaintenanceRequests
                .Include(m => m.Ride)
                .Include(m => m.Reporter)
                .Include(m => m.Assignee)
                .FirstOrDefaultAsync(m => m.RequestId == maintenanceRequest.RequestId);

            return CreatedAtAction("GetMaintenanceRequest", new { id = maintenanceRequest.RequestId }, createdRequest);
        }

        // PUT: api/maintenancerequest/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMaintenanceRequest(int id, MaintenanceRequest maintenanceRequest)
        {
            if (id != maintenanceRequest.RequestId)
            {
                return BadRequest();
            }

            _context.Entry(maintenanceRequest).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/maintenancerequest/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMaintenanceRequest(int id)
        {
            var maintenanceRequest = await _context.MaintenanceRequests.FindAsync(id);
            if (maintenanceRequest == null)
            {
                return NotFound();
            }

            _context.MaintenanceRequests.Remove(maintenanceRequest);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/maintenancerequest/status/{status}
        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<MaintenanceRequest>>> GetMaintenanceRequestsByStatus(string status)
        {
            return await _context.MaintenanceRequests
                .Include(m => m.Ride)
                .Include(m => m.Reporter)
                .Include(m => m.Assignee)
                .Where(m => m.Status == status)
                .ToListAsync();
        }
    }
}
