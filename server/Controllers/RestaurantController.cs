using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AmusementParkAPI.Data;
using AmusementParkAPI.Models;

namespace AmusementParkAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RestaurantController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RestaurantController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/restaurant/menu
        [HttpGet("menu")]
        public async Task<ActionResult<IEnumerable<object>>> GetMenu()
        {
            var menuItems = await _context.Restaurants
                .Select(r => new
                {
                    menuId = r.Menu_ID,
                    menuName = r.Menu_Name,
                    price = r.Price,
                    restaurantId = r.Restaurant_ID
                })
                .ToListAsync();

            return Ok(menuItems);
        }

        // GET: api/restaurant/{restaurantId}/menu
        [HttpGet("{restaurantId}/menu")]
        public async Task<ActionResult<IEnumerable<object>>> GetRestaurantMenu(int restaurantId)
        {
            var menuItems = await _context.Restaurants
                .Where(r => r.Restaurant_ID == restaurantId)
                .Select(r => new
                {
                    menuId = r.Menu_ID,
                    menuName = r.Menu_Name,
                    price = r.Price
                })
                .ToListAsync();

            return Ok(menuItems);
        }

        // POST: api/restaurant/order
        [HttpPost("order")]
        public async Task<ActionResult> CreateOrder([FromBody] RestaurantOrderDto order)
        {
            // Since there's no separate order table, we'll track this as a commodity sale
            // or you might need to create a new table for restaurant orders
            
            // For now, returning a mock response
            return Ok(new { 
                message = "Order placed successfully", 
                orderId = new Random().Next(1000, 9999),
                total = order.TotalPrice 
            });
        }

        // GET: api/restaurant/restaurants
        [HttpGet("restaurants")]
        public async Task<ActionResult<IEnumerable<int>>> GetRestaurants()
        {
            var restaurants = await _context.Restaurants
                .Select(r => r.Restaurant_ID)
                .Distinct()
                .OrderBy(r => r)
                .ToListAsync();

            return Ok(restaurants.Select(r => new { 
                restaurantId = r, 
                restaurantName = $"Restaurant {r}" 
            }));
        }
    }

    public class RestaurantOrderDto
    {
        public int CustomerId { get; set; }
        public List<OrderItem> Items { get; set; } = new List<OrderItem>();
        public decimal TotalPrice { get; set; }
    }

    public class OrderItem
    {
        public int MenuId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}