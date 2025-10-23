using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AmusementParkAPI.Data;
using AmusementParkAPI.Models;

namespace AmusementParkAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TicketController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/ticket/types
        [HttpGet("types")]
        public async Task<ActionResult<IEnumerable<object>>> GetTicketTypes()
        {
            var ticketTypes = await _context.TicketTypes
                .Select(t => new
                {
                    ticketTypeId = t.TicketType_ID,
                    typeName = t.Type_Name,
                    price = t.Base_Price
                })
                .ToListAsync();

            return Ok(ticketTypes);
        }

        // POST: api/ticket/purchase
        [HttpPost("purchase")]
        public async Task<ActionResult> PurchaseTicket([FromBody] TicketPurchaseDto purchase)
        {
            var ticketSale = new TicketSale
            {
                Customer_ID = purchase.CustomerId,
                TicketType_ID = purchase.TicketTypeId,
                Purchase_Date = DateTime.Now,
                Price = purchase.TotalPrice,
                Payment_Method = purchase.PaymentMethod ?? "credit"
            };

            _context.TicketSales.Add(ticketSale);
            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Ticket purchased successfully", 
                ticketId = ticketSale.Ticket_ID 
            });
        }

        // GET: api/ticket/sales
        [HttpGet("sales")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllSales()
        {
            var sales = await _context.TicketSales
                .Join(_context.Customers,
                    sale => sale.Customer_ID,
                    customer => customer.CustomerId,
                    (sale, customer) => new { sale, customer })
                .Join(_context.TicketTypes,
                    sc => sc.sale.TicketType_ID,
                    type => type.TicketType_ID,
                    (sc, type) => new
                    {
                        ticketId = sc.sale.Ticket_ID,
                        purchaseDate = sc.sale.Purchase_Date,
                        price = sc.sale.Price,
                        paymentMethod = sc.sale.Payment_Method,
                        customerName = sc.customer.FirstName + " " + sc.customer.LastName,
                        ticketType = type.Type_Name
                    })
                .OrderByDescending(s => s.purchaseDate)
                .ToListAsync();

            return Ok(sales);
        }

        // GET: api/ticket/customer/{customerId}
        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetCustomerTickets(int customerId)
        {
            var tickets = await _context.TicketSales
                .Where(t => t.Customer_ID == customerId)
                .Join(_context.TicketTypes,
                    sale => sale.TicketType_ID,
                    type => type.TicketType_ID,
                    (sale, type) => new
                    {
                        ticketId = sale.Ticket_ID,
                        purchaseDate = sale.Purchase_Date,
                        price = sale.Price,
                        paymentMethod = sale.Payment_Method,
                        ticketType = type.Type_Name
                    })
                .OrderByDescending(t => t.purchaseDate)
                .ToListAsync();

            return Ok(tickets);
        }
    }

    public class TicketPurchaseDto
    {
        public int CustomerId { get; set; }
        public int TicketTypeId { get; set; }
        public decimal TotalPrice { get; set; }
        public string? PaymentMethod { get; set; }
    }
}