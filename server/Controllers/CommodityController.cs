using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
                .Select(c => new
                {
                    commodityTypeId = c.Commodity_TypeID,
                    commodityName = c.Commodity_Name,
                    basePrice = c.Base_Price,
                    commodityStore = c.Commodity_Store
                })
                .ToListAsync();

            return Ok(commodityTypes);
        }

        // POST: api/commodity/purchase
        [HttpPost("purchase")]
        public async Task<ActionResult> PurchaseCommodity([FromBody] CommodityPurchaseDto purchase)
        {
            var commoditySale = new CommoditySale
            {
                Customer_ID = purchase.CustomerId,
                Commodity_TypeID = purchase.CommodityTypeId,
                Purchase_Date = DateTime.Now,
                Price = purchase.TotalPrice,
                Payment_Method = purchase.PaymentMethod ?? "credit"
            };

            _context.CommoditySales.Add(commoditySale);
            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Purchase successful", 
                saleId = commoditySale.Commodity_SaleID 
            });
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
                        commodityName = type.Commodity_Name,
                        store = type.Commodity_Store
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
                .Where(c => c.Commodity_Store == storeId)
                .Select(c => new
                {
                    commodityTypeId = c.Commodity_TypeID,
                    commodityName = c.Commodity_Name,
                    basePrice = c.Base_Price,
                    commodityStore = c.Commodity_Store
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
                        customerName = sc.customer.FirstName + " " + sc.customer.LastName,
                        commodityName = type.Commodity_Name
                    })
                .OrderByDescending(s => s.purchaseDate)
                .ToListAsync();

            return Ok(sales);
        }
    }

    public class CommodityPurchaseDto
    {
        public int CustomerId { get; set; }
        public int CommodityTypeId { get; set; }
        public decimal TotalPrice { get; set; }
        public string? PaymentMethod { get; set; }
    }
}