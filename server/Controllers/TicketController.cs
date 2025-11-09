using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
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
                .Where(t => !t.Is_Discontinued)
                .Include(t => t.Ride)
                .Select(t => new
                {
                    ticketTypeId = t.TicketType_ID,
                    typeName = t.Type_Name,
                    price = t.Base_Price,
                    rideId = t.Ride_ID,
                    rideName = t.Ride != null ? t.Ride.Ride_Name : null,
                    description = t.Description,
                    isDiscontinued = t.Is_Discontinued
                })
                .OrderBy(t => t.ticketTypeId)
                .ToListAsync();

            return Ok(ticketTypes);
        }

        // GET: api/ticket/types/discontinued
        [HttpGet("types/discontinued")]
        public async Task<ActionResult<IEnumerable<object>>> GetDiscontinuedTicketTypes()
        {
            var ticketTypes = await _context.TicketTypes
                .Where(t => t.Is_Discontinued)
                .Include(t => t.Ride)
                .Select(t => new
                {
                    ticketTypeId = t.TicketType_ID,
                    typeName = t.Type_Name,
                    price = t.Base_Price,
                    rideId = t.Ride_ID,
                    rideName = t.Ride != null ? t.Ride.Ride_Name : null,
                    description = t.Description,
                    isDiscontinued = t.Is_Discontinued
                })
                .OrderBy(t => t.ticketTypeId)
                .ToListAsync();

            return Ok(ticketTypes);
        }

        // POST: api/ticket/types
        [HttpPost("types")]
        public async Task<ActionResult<object>> CreateTicketType([FromBody] TicketTypeCreateRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var ride = await _context.Rides.FindAsync(request.RideId);
            if (ride == null)
            {
                return NotFound(new { message = "Associated ride not found." });
            }

            var rideInUse = await _context.TicketTypes
                .AnyAsync(t => !t.Is_Discontinued && t.Ride_ID == request.RideId);
            if (rideInUse)
            {
                return Conflict(new { message = "A ticket type is already assigned to this ride." });
            }

            var ticketType = new TicketType
            {
                Type_Name = request.TypeName.Trim(),
                Base_Price = request.BasePrice,
                Ride_ID = request.RideId,
                Description = string.IsNullOrWhiteSpace(request.Description)
                    ? null
                    : request.Description.Trim(),
                Is_Discontinued = false
            };

            _context.TicketTypes.Add(ticketType);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetTicketTypes),
                null,
                new
                {
                    ticketTypeId = ticketType.TicketType_ID,
                    typeName = ticketType.Type_Name,
                    price = ticketType.Base_Price,
                    rideId = ticketType.Ride_ID,
                    description = ticketType.Description,
                    isDiscontinued = ticketType.Is_Discontinued
                });
        }

        // PUT: api/ticket/types/{id}
        [HttpPut("types/{id}")]
        public async Task<ActionResult> UpdateTicketType(int id, [FromBody] TicketTypeUpdateRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var ticketType = await _context.TicketTypes.FindAsync(id);
            if (ticketType == null)
            {
                return NotFound();
            }

            if (request.RideId.HasValue && request.RideId.Value != ticketType.Ride_ID)
            {
                var ride = await _context.Rides.FindAsync(request.RideId.Value);
                if (ride == null)
                {
                    return NotFound(new { message = "Associated ride not found." });
                }

                var rideInUse = await _context.TicketTypes
                    .AnyAsync(t => !t.Is_Discontinued && t.Ride_ID == request.RideId.Value && t.TicketType_ID != id);
                if (rideInUse)
                {
                    return Conflict(new { message = "A ticket type is already assigned to this ride." });
                }

                ticketType.Ride_ID = request.RideId.Value;
            }

            if (!string.IsNullOrWhiteSpace(request.TypeName))
            {
                ticketType.Type_Name = request.TypeName.Trim();
            }

            if (request.BasePrice.HasValue)
            {
                ticketType.Base_Price = request.BasePrice.Value;
            }

            if (request.Description != null)
            {
                ticketType.Description = string.IsNullOrWhiteSpace(request.Description)
                    ? null
                    : request.Description.Trim();
            }

            if (request.IsDiscontinued.HasValue)
            {
                ticketType.Is_Discontinued = request.IsDiscontinued.Value;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/ticket/types/{id}
        [HttpDelete("types/{id}")]
        public async Task<ActionResult> DeleteTicketType(int id)
        {
            var ticketType = await _context.TicketTypes.FindAsync(id);
            if (ticketType == null)
            {
                return NotFound();
            }

            if (ticketType.Is_Discontinued)
            {
                return NoContent();
            }

            ticketType.Is_Discontinued = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/ticket/types/{id}/restore
        [HttpPut("types/{id}/restore")]
        public async Task<ActionResult> RestoreTicketType(int id)
        {
            var ticketType = await _context.TicketTypes.FindAsync(id);
            if (ticketType == null)
            {
                return NotFound();
            }

            if (!ticketType.Is_Discontinued)
            {
                return NoContent();
            }

            var rideInUse = await _context.TicketTypes
                .AnyAsync(t => !t.Is_Discontinued && t.Ride_ID == ticketType.Ride_ID && t.TicketType_ID != id);
            if (rideInUse)
            {
                return Conflict(new { message = "Another active ticket type is already assigned to this ride." });
            }

            ticketType.Is_Discontinued = false;
            await _context.SaveChangesAsync();

            return NoContent();
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

    public class TicketTypeCreateRequest
    {
        [Required]
        [MaxLength(50)]
        public string TypeName { get; set; } = string.Empty;

        [Range(0.01, double.MaxValue)]
        public decimal BasePrice { get; set; }

        [Required]
        public int RideId { get; set; }

        [MaxLength(255)]
        public string? Description { get; set; }
    }

    public class TicketTypeUpdateRequest
    {
        [MaxLength(50)]
        public string? TypeName { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal? BasePrice { get; set; }

        public int? RideId { get; set; }

        [MaxLength(255)]
        public string? Description { get; set; }

        public bool? IsDiscontinued { get; set; }
    }
}