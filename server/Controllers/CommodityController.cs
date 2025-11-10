using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using AmusementParkAPI.Data;
using AmusementParkAPI.Models;

namespace AmusementParkAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommodityController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CommodityController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/commodity/types
        [HttpGet("types")]
        public async Task<ActionResult<IEnumerable<object>>> GetCommodityTypes()
        {
            var commodityTypes = await _context.CommodityTypes
                .Where(c => c.Category == "merchandise" && !c.Is_Discontinued) // Only show active merchandise
                .Select(c => new
                {
                    commodityTypeId = c.Commodity_TypeID,
                    commodityName = c.Commodity_Name,
                    basePrice = c.Base_Price,
                    commodityStore = c.Commodity_Store,
                    stockQuantity = c.Stock_Quantity,
                    category = c.Category,
                    displayCategory = c.Display_Category,
                    description = c.Description,
                    imageUrl = c.Image_Url,
                    isDiscontinued = c.Is_Discontinued
                })
                .OrderBy(c => c.commodityTypeId)
                .ToListAsync();

            return Ok(commodityTypes);
        }

        // GET: api/commodity/types/discontinued
        [HttpGet("types/discontinued")]
        public async Task<ActionResult<IEnumerable<object>>> GetDiscontinuedCommodityTypes()
        {
            var commodityTypes = await _context.CommodityTypes
                .Where(c => c.Is_Discontinued)
                .Select(c => new
                {
                    commodityTypeId = c.Commodity_TypeID,
                    commodityName = c.Commodity_Name,
                    basePrice = c.Base_Price,
                    stockQuantity = c.Stock_Quantity,
                    description = c.Description,
                    imageUrl = c.Image_Url,
                    isDiscontinued = c.Is_Discontinued,
                    category = c.Category,
                    displayCategory = c.Display_Category
                })
                .OrderBy(c => c.commodityTypeId)
                .ToListAsync();

            return Ok(commodityTypes);
        }

        // POST: api/commodity/types
        [HttpPost("types")]
        public async Task<ActionResult<object>> CreateCommodityType([FromBody] CommodityTypeCreateRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var commodityType = new CommodityType
            {
                Commodity_Name = request.CommodityName.Trim(),
                Base_Price = request.BasePrice,
                Stock_Quantity = request.StockQuantity,
                Description = string.IsNullOrWhiteSpace(request.Description)
                    ? null
                    : request.Description.Trim(),
                Category = request.Category ?? "merchandise",
                Display_Category = request.DisplayCategory ?? "Uncategorized",
                Commodity_Store = request.CommodityStore,
                Image_Url = string.IsNullOrWhiteSpace(request.ImageUrl)
                    ? null
                    : request.ImageUrl.Trim(),
                Is_Discontinued = false
            };

            _context.CommodityTypes.Add(commodityType);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetCommodityTypes),
                null,
                new
                {
                    commodityTypeId = commodityType.Commodity_TypeID,
                    commodityName = commodityType.Commodity_Name,
                    basePrice = commodityType.Base_Price,
                    stockQuantity = commodityType.Stock_Quantity,
                    description = commodityType.Description,
                    category = commodityType.Category,
                    displayCategory = commodityType.Display_Category,
                    imageUrl = commodityType.Image_Url,
                    isDiscontinued = commodityType.Is_Discontinued
                });
        }

        // PUT: api/commodity/types/{id}
        [HttpPut("types/{id}")]
        public async Task<ActionResult> UpdateCommodityType(int id, [FromBody] CommodityTypeUpdateRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var commodityType = await _context.CommodityTypes.FindAsync(id);
            if (commodityType == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrWhiteSpace(request.CommodityName))
            {
                commodityType.Commodity_Name = request.CommodityName.Trim();
            }

            if (request.BasePrice.HasValue)
            {
                commodityType.Base_Price = request.BasePrice.Value;
            }

            if (request.StockQuantity.HasValue)
            {
                commodityType.Stock_Quantity = request.StockQuantity.Value;
            }

            if (request.Description != null)
            {
                commodityType.Description = string.IsNullOrWhiteSpace(request.Description)
                    ? null
                    : request.Description.Trim();
            }

            if (request.ImageUrl != null)
            {
                commodityType.Image_Url = string.IsNullOrWhiteSpace(request.ImageUrl)
                    ? null
                    : request.ImageUrl.Trim();
            }

            if (request.IsDiscontinued.HasValue)
            {
                commodityType.Is_Discontinued = request.IsDiscontinued.Value;
            }

            if (request.Category != null)
            {
                commodityType.Category = request.Category;
            }

            if (request.DisplayCategory != null)
            {
                commodityType.Display_Category = request.DisplayCategory;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/commodity/types/{id}
        [HttpDelete("types/{id}")]
        public async Task<ActionResult> DeleteCommodityType(int id)
        {
            var commodityType = await _context.CommodityTypes.FindAsync(id);
            if (commodityType == null)
            {
                return NotFound();
            }

            if (commodityType.Is_Discontinued)
            {
                return NoContent();
            }

            commodityType.Is_Discontinued = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/commodity/types/{id}/restore
        [HttpPut("types/{id}/restore")]
        public async Task<ActionResult> RestoreCommodityType(int id)
        {
            var commodityType = await _context.CommodityTypes.FindAsync(id);
            if (commodityType == null)
            {
                return NotFound();
            }

            if (!commodityType.Is_Discontinued)
            {
                return NoContent();
            }

            commodityType.Is_Discontinued = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/commodity/purchase
        [HttpPost("purchase")]
        public async Task<ActionResult> PurchaseCommodity([FromBody] CommodityPurchaseDto purchase)
        {
            try
            {
                // Create the sale record - trigger will validate and deduct stock
                var commoditySale = new CommoditySale
                {
                    Customer_ID = purchase.CustomerId,
                    Commodity_TypeID = purchase.CommodityTypeId,
                    Quantity = purchase.Quantity,
                    Purchase_Date = DateTime.Now,
                    Price = purchase.TotalPrice,
                    Payment_Method = purchase.PaymentMethod ?? "credit"
                };

                _context.CommoditySales.Add(commoditySale);
                await _context.SaveChangesAsync();

                // Get updated stock quantity
                var commodityType = await _context.CommodityTypes
                    .FirstOrDefaultAsync(c => c.Commodity_TypeID == purchase.CommodityTypeId);

                return Ok(new {
                    message = "Purchase successful",
                    saleId = commoditySale.Commodity_SaleID,
                    remainingStock = commodityType?.Stock_Quantity ?? 0
                });
            }
            catch (DbUpdateException ex)
            {
                // Database trigger threw an error
                var innerMessage = ex.InnerException?.Message ?? ex.Message;

                // Extract the custom error message from the trigger
                if (innerMessage.Contains("out of stock") ||
                    innerMessage.Contains("Insufficient stock") ||
                    innerMessage.Contains("Quantity must be greater than 0"))
                {
                    return BadRequest(new { message = innerMessage });
                }

                return BadRequest(new { message = "Purchase failed: " + innerMessage });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred: " + ex.Message });
            }
        }

        // GET: api/commodity/customer/{customerId}
        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetCustomerPurchases(int customerId)
        {
            var purchases = await _context.CommoditySales
                .Where(c => c.Customer_ID == customerId)
                .Join(_context.CommodityTypes,
                    sale => sale.Commodity_TypeID,
                    type => type.Commodity_TypeID,
                    (sale, type) => new
                    {
                        saleId = sale.Commodity_SaleID,
                        purchaseDate = sale.Purchase_Date,
                        price = sale.Price,
                        paymentMethod = sale.Payment_Method,
                        quantity = sale.Quantity,
                        commodityName = type.Commodity_Name
                    })
                .OrderByDescending(p => p.purchaseDate)
                .ToListAsync();

            return Ok(purchases);
        }

        // GET: api/commodity/stores
        [HttpGet("stores")]
        public async Task<ActionResult<IEnumerable<int>>> GetStores()
        {
            var stores = await _context.CommodityTypes
                .Select(c => c.Commodity_Store)
                .Distinct()
                .OrderBy(s => s)
                .ToListAsync();

            return Ok(stores);
        }

        // GET: api/commodity/store/{storeId}
        [HttpGet("store/{storeId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetStoreProducts(int storeId)
        {
            var products = await _context.CommodityTypes
                .Where(c => c.Commodity_Store == storeId && c.Category == "merchandise") // Only merchandise
                .Select(c => new
                {
                    commodityTypeId = c.Commodity_TypeID,
                    commodityName = c.Commodity_Name,
                    basePrice = c.Base_Price,
                    commodityStore = c.Commodity_Store,
                    stockQuantity = c.Stock_Quantity,
                    category = c.Category,
                    displayCategory = c.Display_Category,
                    imageUrl = c.Image_Url
                })
                .ToListAsync();

            return Ok(products);
        }

        // GET: api/commodity/sales
        [HttpGet("sales")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllSales()
        {
            var sales = await _context.CommoditySales
                .Join(_context.Customers,
                    sale => sale.Customer_ID,
                    customer => customer.CustomerId,
                    (sale, customer) => new { sale, customer })
                .Join(_context.CommodityTypes,
                    sc => sc.sale.Commodity_TypeID,
                    type => type.Commodity_TypeID,
                    (sc, type) => new
                    {
                        commoditySaleId = sc.sale.Commodity_SaleID,
                        purchaseDate = sc.sale.Purchase_Date,
                        price = sc.sale.Price,
                        paymentMethod = sc.sale.Payment_Method,
                        quantity = sc.sale.Quantity,
                        customerName = sc.customer.FirstName + " " + sc.customer.LastName,
                        commodityName = type.Commodity_Name
                    })
                .OrderByDescending(s => s.purchaseDate)
                .ToListAsync();

            return Ok(sales);
        }
    }

    public class CommodityTypeCreateRequest
    {
        [Required]
        [MaxLength(50)]
        public string CommodityName { get; set; } = string.Empty;

        [Range(0.01, double.MaxValue)]
        public decimal BasePrice { get; set; }

        [Range(0, int.MaxValue)]
        public int StockQuantity { get; set; }

        [MaxLength(255)]
        public string? Description { get; set; }

        public string? Category { get; set; }
        public string? DisplayCategory { get; set; }
        public int CommodityStore { get; set; } = 1;

        [MaxLength(500)]
        public string? ImageUrl { get; set; }
    }

    public class CommodityTypeUpdateRequest
    {
        [MaxLength(50)]
        public string? CommodityName { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal? BasePrice { get; set; }

        [Range(0, int.MaxValue)]
        public int? StockQuantity { get; set; }

        [MaxLength(255)]
        public string? Description { get; set; }

        public bool? IsDiscontinued { get; set; }

        public string? Category { get; set; }
        public string? DisplayCategory { get; set; }

        [MaxLength(500)]
        public string? ImageUrl { get; set; }
    }

    public class CommodityPurchaseDto
    {
        public int CustomerId { get; set; }
        public int CommodityTypeId { get; set; }
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; } = 1;
        public decimal TotalPrice { get; set; }
        public string? PaymentMethod { get; set; }
    }
}
