using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AmusementParkAPI.Data;
using AmusementParkAPI.Models;

namespace AmusementParkAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RidesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RidesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/rides
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Rides>>> GetRides()
        {
            return await _context.Rides.ToListAsync();
        }

        // GET: api/rides/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Rides>> GetRide(int id)
        {
            var ride = await _context.Rides.FindAsync(id);
            if (ride == null)
            {
                return NotFound();
            }
            return ride;
        }

        // POST: api/rides
        [HttpPost]
        public async Task<ActionResult<Rides>> PostRide(Rides ride)
        {
            _context.Rides.Add(ride);
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetRide", new { id = ride.Ride_ID }, ride);
        }

        // PUT: api/rides/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRide(int id, Rides ride)
        {
            if (id != ride.Ride_ID)
            {
                return BadRequest();
            }

            _context.Entry(ride).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/rides/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRide(int id)
        {
            var ride = await _context.Rides.FindAsync(id);
            if (ride == null)
            {
                return NotFound();
            }

            _context.Rides.Remove(ride);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}