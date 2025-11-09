using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using AmusementParkAPI.Data;
using AmusementParkAPI.Models;

namespace AmusementParkAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MenuController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MenuController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/menu/types
        [HttpGet("types")]
        public async Task<ActionResult<IEnumerable<object>>> GetMenuTypes()
        {
            var menuTypes = await _context.MenuTypes
                .Where(mt => !mt.Is_Discontinued)
                .Select(mt => new
                {
                    menuTypeId = mt.MenuType_ID,
                    foodName = mt.Food_Name,
                    basePrice = mt.Base_Price,
                    description = mt.Description,
                    isDiscontinued = mt.Is_Discontinued
                })
                .ToListAsync();

            return Ok(menuTypes);
        }

        // GET: api/menu/types/discontinued
        [HttpGet("types/discontinued")]
        public async Task<ActionResult<IEnumerable<object>>> GetDiscontinuedMenuTypes()
        {
            var menuTypes = await _context.MenuTypes
                .Where(mt => mt.Is_Discontinued)
                .Select(mt => new
                {
                    menuTypeId = mt.MenuType_ID,
                    foodName = mt.Food_Name,
                    basePrice = mt.Base_Price,
                    description = mt.Description,
                    isDiscontinued = mt.Is_Discontinued
                })
                .ToListAsync();

            return Ok(menuTypes);
        }

        // POST: api/menu/types
        [HttpPost("types")]
        public async Task<ActionResult<object>> CreateMenuType([FromBody] MenuTypeCreateDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var menuType = new MenuType
            {
                Food_Name = request.FoodName.Trim(),
                Base_Price = request.BasePrice,
                Description = string.IsNullOrWhiteSpace(request.Description)
                    ? null
                    : request.Description.Trim(),
                Is_Discontinued = request.IsDiscontinued ?? false
            };

            _context.MenuTypes.Add(menuType);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetMenuTypes),
                null,
                new
                {
                    menuTypeId = menuType.MenuType_ID,
                    foodName = menuType.Food_Name,
                    basePrice = menuType.Base_Price,
                    description = menuType.Description,
                    isDiscontinued = menuType.Is_Discontinued
                });
        }

        // PUT: api/menu/types/{id}
        [HttpPut("types/{id}")]
        public async Task<ActionResult> UpdateMenuType(int id, [FromBody] MenuTypeUpdateDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var menuType = await _context.MenuTypes.FindAsync(id);

            if (menuType == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrWhiteSpace(request.FoodName))
            {
                menuType.Food_Name = request.FoodName.Trim();
            }

            if (request.BasePrice.HasValue)
            {
                menuType.Base_Price = request.BasePrice.Value;
            }

            if (request.Description != null)
            {
                menuType.Description = string.IsNullOrWhiteSpace(request.Description)
                    ? null
                    : request.Description.Trim();
            }

            if (request.IsDiscontinued.HasValue)
            {
                menuType.Is_Discontinued = request.IsDiscontinued.Value;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/menu/types/{id}
        [HttpDelete("types/{id}")]
        public async Task<ActionResult> DeleteMenuType(int id)
        {
            var menuType = await _context.MenuTypes.FindAsync(id);

            if (menuType == null)
            {
                return NotFound();
            }

            if (menuType.Is_Discontinued)
            {
                return NoContent();
            }

            menuType.Is_Discontinued = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/menu/types/{id}/restore
        [HttpPut("types/{id}/restore")]
        public async Task<ActionResult> RestoreMenuType(int id)
        {
            var menuType = await _context.MenuTypes.FindAsync(id);

            if (menuType == null)
            {
                return NotFound();
            }

            if (!menuType.Is_Discontinued)
            {
                return NoContent();
            }

            menuType.Is_Discontinued = false;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class MenuTypeCreateDto
    {
        [Required]
        [MaxLength(50)]
        public string FoodName { get; set; } = string.Empty;

        [Range(0.01, double.MaxValue)]
        public decimal BasePrice { get; set; }

        [MaxLength(255)]
        public string? Description { get; set; }

        public bool? IsDiscontinued { get; set; }
    }

    public class MenuTypeUpdateDto
    {
        [MaxLength(50)]
        public string? FoodName { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal? BasePrice { get; set; }

        [MaxLength(255)]
        public string? Description { get; set; }

        public bool? IsDiscontinued { get; set; }
    }
}
