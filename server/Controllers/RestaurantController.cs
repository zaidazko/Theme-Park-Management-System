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

        // GET: api/restaurant/all
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllRestaurants()
        {
            var restaurants = await _context.Restaurants
                .Select(r => new
                {
                    restaurantId = r.Restaurant_ID,
                    restaurantName = r.Restaurant_Name,
                    location = r.Location,
                    cuisineType = r.Cuisine_Type,
                    openingTime = r.Opening_Time,
                    closingTime = r.Closing_Time
                })
                .ToListAsync();

            return Ok(restaurants);
        }

        // GET: api/restaurant/{restaurantId}/menu
        [HttpGet("{restaurantId}/menu")]
        public async Task<ActionResult<IEnumerable<object>>> GetRestaurantMenu(int restaurantId)
        {
            var menuItems = await _context.MenuItems
                .Where(m => m.Restaurant_ID == restaurantId && m.Available)
                .Select(m => new
                {
                    menuId = m.Menu_ID,
                    itemName = m.Item_Name,
                    itemDescription = m.Item_Description,
                    price = m.Price,
                    category = m.Category
                })
                .ToListAsync();

            return Ok(menuItems);
        }

        // POST: api/restaurant/order
        [HttpPost("order")]
        public async Task<ActionResult> PlaceOrder([FromBody] RestaurantOrderDto orderDto)
        {
            // Create the order
            var order = new RestaurantOrder
            {
                Customer_ID = orderDto.CustomerId,
                Restaurant_ID = orderDto.RestaurantId,
                Order_Date = DateTime.Now,
                Total_Price = orderDto.TotalPrice,
                Payment_Method = orderDto.PaymentMethod ?? "credit",
                Order_Status = "Completed"
            };

            _context.RestaurantOrders.Add(order);
            await _context.SaveChangesAsync();

            // Create order items
            foreach (var item in orderDto.Items)
            {
                var orderItem = new OrderItem
                {
                    Order_ID = order.Order_ID,
                    Menu_ID = item.MenuId,
                    Quantity = item.Quantity,
                    Item_Price = item.ItemPrice
                };
                _context.OrderItems.Add(orderItem);
            }

            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Order placed successfully", 
                orderId = order.Order_ID 
            });
        }

        // GET: api/restaurant/orders
        [HttpGet("orders")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllOrders()
        {
            var orders = await _context.RestaurantOrders
                .Join(_context.Customers,
                    order => order.Customer_ID,
                    customer => customer.CustomerId,
                    (order, customer) => new { order, customer })
                .Join(_context.Restaurants,
                    oc => oc.order.Restaurant_ID,
                    restaurant => restaurant.Restaurant_ID,
                    (oc, restaurant) => new
                    {
                        orderId = oc.order.Order_ID,
                        orderDate = oc.order.Order_Date,
                        totalPrice = oc.order.Total_Price,
                        paymentMethod = oc.order.Payment_Method,
                        orderStatus = oc.order.Order_Status,
                        customerName = oc.customer.FirstName + " " + oc.customer.LastName,
                        restaurantName = restaurant.Restaurant_Name
                    })
                .OrderByDescending(o => o.orderDate)
                .ToListAsync();

            return Ok(orders);
        }

        // GET: api/restaurant/customer/{customerId}/orders
        [HttpGet("customer/{customerId}/orders")]
        public async Task<ActionResult<IEnumerable<object>>> GetCustomerOrders(int customerId)
        {
            var orders = await _context.RestaurantOrders
                .Where(o => o.Customer_ID == customerId)
                .Join(_context.Restaurants,
                    order => order.Restaurant_ID,
                    restaurant => restaurant.Restaurant_ID,
                    (order, restaurant) => new
                    {
                        orderId = order.Order_ID,
                        orderDate = order.Order_Date,
                        totalPrice = order.Total_Price,
                        paymentMethod = order.Payment_Method,
                        orderStatus = order.Order_Status,
                        restaurantName = restaurant.Restaurant_Name
                    })
                .OrderByDescending(o => o.orderDate)
                .ToListAsync();

            return Ok(orders);
        }
    }

    public class RestaurantOrderDto
    {
        public int CustomerId { get; set; }
        public int RestaurantId { get; set; }
        public decimal TotalPrice { get; set; }
        public string? PaymentMethod { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
    }

    public class OrderItemDto
    {
        public int MenuId { get; set; }
        public int Quantity { get; set; }
        public decimal ItemPrice { get; set; }
    }
}