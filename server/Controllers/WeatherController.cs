using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AmusementParkAPI.Data;
using AmusementParkAPI.Models;

namespace AmusementParkAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class WeatherController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public WeatherController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/weather
        [HttpGet]
        public async Task<ActionResult<Weather>> GetLatestWeather()
        {
            var weather = await _context.Weather
                .OrderByDescending(w => w.WeatherDate)
                .FirstOrDefaultAsync();

            if (weather == null)
            {
                return NotFound();
            }
            return weather;
        }

        // GET: api/weather/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Weather>> GetWeather(int id)
        {
            var weather = await _context.Weather.FindAsync(id);

            if (weather == null)
            {
                return NotFound();
            }

            return weather;
        }

        // POST: api/weather
        [HttpPost]
        public async Task<ActionResult<Weather>> PostWeather(Weather weather)
        {
            weather.WeatherDate = DateTime.Now;
            _context.Weather.Add(weather);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetWeather), new { id = weather.WeatherId }, weather);
        }
    }
}
