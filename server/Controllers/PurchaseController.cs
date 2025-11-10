using AmusementParkAPI.Data;
using AmusementParkAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace AmusementParkAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PurchaseController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PurchaseController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("checkout")]
        public async Task<ActionResult<UnifiedPurchaseResponse>> Checkout([FromBody] UnifiedPurchaseRequest request)
        {
            if (request == null || request.Items == null || request.Items.Count == 0)
            {
                return BadRequest(new { message = "Cart is empty." });
            }

            if (request.CustomerId <= 0)
            {
                return BadRequest(new { message = "Customer ID is required." });
            }

            var customerExists = await _context.Customers.AnyAsync(c => c.CustomerId == request.CustomerId);
            if (!customerExists)
            {
                return NotFound(new { message = "Customer not found." });
            }

            var normalizedItems = request.Items
                .Select(item => new NormalizedItem
                {
                    Category = item.Category?.Trim().ToLowerInvariant() ?? string.Empty,
                    TypeId = item.TypeId,
                    Quantity = item.Quantity <= 0 ? 1 : item.Quantity
                })
                .ToList();

            if (normalizedItems.Any(i => string.IsNullOrWhiteSpace(i.Category)))
            {
                return BadRequest(new { message = "Each item must include a category." });
            }

            if (normalizedItems.Any(i => i.TypeId <= 0))
            {
                return BadRequest(new { message = "Each item must include a valid type identifier." });
            }

            var purchaseDate = request.PurchaseDate?.ToUniversalTime() ?? DateTime.UtcNow;
            var paymentMethod = string.IsNullOrWhiteSpace(request.PaymentMethod) ? "credit" : request.PaymentMethod.Trim();

            var ticketIds = normalizedItems
                .Where(i => i.Category is "ticket" or "tickets")
                .Select(i => i.TypeId)
                .Distinct()
                .ToList();

            var menuIds = normalizedItems
                .Where(i => i.Category is "menu" or "food" or "meal")
                .Select(i => i.TypeId)
                .Distinct()
                .ToList();

            var commodityIds = normalizedItems
                .Where(i => i.Category is "commodity" or "merch" or "merchandise")
                .Select(i => i.TypeId)
                .Distinct()
                .ToList();

            var ticketTypes = ticketIds.Count == 0
                ? new Dictionary<int, TicketType>()
                : await _context.TicketTypes
                    .Where(t => ticketIds.Contains(t.TicketType_ID))
                    .ToDictionaryAsync(t => t.TicketType_ID);

            var menuTypes = menuIds.Count == 0
                ? new Dictionary<int, MenuType>()
                : await _context.MenuTypes
                    .Where(m => menuIds.Contains(m.MenuType_ID))
                    .ToDictionaryAsync(m => m.MenuType_ID);

            var commodityTypes = commodityIds.Count == 0
                ? new Dictionary<int, CommodityType>()
                : await _context.CommodityTypes
                    .Where(c => commodityIds.Contains(c.Commodity_TypeID))
                    .ToDictionaryAsync(c => c.Commodity_TypeID);

            var summaries = new List<PurchaseItemSummary>();
            var ticketSales = new List<TicketSale>();
            var menuSales = new List<MenuSale>();
            var commoditySales = new List<CommoditySale>();

            foreach (var item in normalizedItems)
            {
                switch (item.Category)
                {
                    case "ticket":
                    case "tickets":
                        if (!ticketTypes.TryGetValue(item.TypeId, out var ticketType))
                        {
                            return NotFound(new { message = $"Ticket type {item.TypeId} not found." });
                        }

                        if (ticketType.Is_Discontinued)
                        {
                            return Conflict(new { message = $"Ticket type '{ticketType.Type_Name}' is discontinued." });
                        }

                        var ticketUnitPrice = ticketType.Base_Price;
                        var ticketTotal = ticketUnitPrice * item.Quantity;

                        ticketSales.Add(new TicketSale
                        {
                            Customer_ID = request.CustomerId,
                            TicketType_ID = ticketType.TicketType_ID,
                            Price = ticketTotal,
                            Payment_Method = paymentMethod,
                            Purchase_Date = purchaseDate,
                            Quantity = item.Quantity
                        });

                        summaries.Add(new PurchaseItemSummary
                        {
                            Category = "ticket",
                            TypeId = ticketType.TicketType_ID,
                            Name = ticketType.Type_Name,
                            Quantity = item.Quantity,
                            UnitPrice = ticketUnitPrice,
                            Subtotal = ticketUnitPrice * item.Quantity
                        });

                        break;

                    case "menu":
                    case "food":
                    case "meal":
                        if (!menuTypes.TryGetValue(item.TypeId, out var menuType))
                        {
                            return NotFound(new { message = $"Menu item {item.TypeId} not found." });
                        }

                        if (menuType.Is_Discontinued)
                        {
                            return Conflict(new { message = $"Menu item '{menuType.Food_Name}' is discontinued." });
                        }

                        var menuUnitPrice = menuType.Base_Price;
                        var menuTotal = menuUnitPrice * item.Quantity;

                        menuSales.Add(new MenuSale
                        {
                            Customer_ID = request.CustomerId,
                            MenuType_ID = menuType.MenuType_ID,
                            Price = menuTotal,
                            Payment_Method = paymentMethod,
                            Purchase_Date = purchaseDate,
                            Quantity = item.Quantity
                        });

                        summaries.Add(new PurchaseItemSummary
                        {
                            Category = "menu",
                            TypeId = menuType.MenuType_ID,
                            Name = menuType.Food_Name,
                            Quantity = item.Quantity,
                            UnitPrice = menuUnitPrice,
                            Subtotal = menuUnitPrice * item.Quantity
                        });

                        break;

                    case "commodity":
                    case "merch":
                    case "merchandise":
                        if (!commodityTypes.TryGetValue(item.TypeId, out var commodityType))
                        {
                            return NotFound(new { message = $"Merchandise item {item.TypeId} not found." });
                        }

                        if (commodityType.Is_Discontinued)
                        {
                            return Conflict(new { message = $"Merchandise item '{commodityType.Commodity_Name}' is discontinued." });
                        }

                        if (commodityType.Stock_Quantity < item.Quantity)
                        {
                            return Conflict(new { message = $"Only {commodityType.Stock_Quantity} units of '{commodityType.Commodity_Name}' remain in stock." });
                        }

                        var commodityUnitPrice = commodityType.Base_Price;
                        var commodityTotal = commodityUnitPrice * item.Quantity;

                        commodityType.Stock_Quantity -= item.Quantity;

                        commoditySales.Add(new CommoditySale
                        {
                            Customer_ID = request.CustomerId,
                            Commodity_TypeID = commodityType.Commodity_TypeID,
                            Price = commodityTotal,
                            Payment_Method = paymentMethod,
                            Purchase_Date = purchaseDate,
                            Quantity = item.Quantity
                        });

                        summaries.Add(new PurchaseItemSummary
                        {
                            Category = "commodity",
                            TypeId = commodityType.Commodity_TypeID,
                            Name = commodityType.Commodity_Name,
                            Quantity = item.Quantity,
                            UnitPrice = commodityUnitPrice,
                            Subtotal = commodityUnitPrice * item.Quantity
                        });

                        break;

                    default:
                        return BadRequest(new { message = $"Unsupported item category '{item.Category}'." });
                }
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (ticketSales.Count > 0)
                {
                    _context.TicketSales.AddRange(ticketSales);
                }

                if (menuSales.Count > 0)
                {
                    _context.MenuSales.AddRange(menuSales);
                }

                if (commoditySales.Count > 0)
                {
                    _context.CommoditySales.AddRange(commoditySales);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            var response = new UnifiedPurchaseResponse
            {
                PaymentMethod = paymentMethod,
                PurchaseDate = purchaseDate,
                CardLast4 = request.CardLast4,
                TotalCharged = summaries.Sum(s => s.Subtotal),
                Items = summaries
            };

            return Ok(response);
        }

        private sealed class NormalizedItem
        {
            public string Category { get; set; } = string.Empty;
            public int TypeId { get; set; }
            public int Quantity { get; set; }
        }
    }

    public sealed class UnifiedPurchaseRequest
    {
        public int CustomerId { get; set; }
        public string? PaymentMethod { get; set; }
        public string? CardLast4 { get; set; }
        public DateTime? PurchaseDate { get; set; }
        public List<UnifiedPurchaseItem> Items { get; set; } = new();
    }

    public sealed class UnifiedPurchaseItem
    {
        public string? Category { get; set; }
        public int TypeId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public sealed class UnifiedPurchaseResponse
    {
        public string PaymentMethod { get; set; } = "credit";
        public DateTime PurchaseDate { get; set; }
        public string? CardLast4 { get; set; }
        public decimal TotalCharged { get; set; }
        public List<PurchaseItemSummary> Items { get; set; } = new();
    }

    public sealed class PurchaseItemSummary
    {
        public string Category { get; set; } = string.Empty;
        public int TypeId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Subtotal { get; set; }
    }
}
