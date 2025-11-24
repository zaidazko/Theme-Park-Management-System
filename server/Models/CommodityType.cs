using System.ComponentModel.DataAnnotations.Schema;
using Lifecycle = AmusementParkAPI.Models.LifecycleStatus;

namespace AmusementParkAPI.Models
{
    public class CommodityType
    {
        public int Commodity_TypeID { get; set; }
        public string Commodity_Name { get; set; } = string.Empty;
        public decimal Base_Price { get; set; }
        public int Commodity_Store { get; set; }
        public int Stock_Quantity { get; set; } = 0;
        [Column("Stock_Floor")]
        public int Stock_Floor { get; set; } = 0;
        [Column("Is_Stock_Low")]
        public bool Is_Stock_Low { get; set; }
        public string Category { get; set; } = "merchandise";
        public string Display_Category { get; set; } = "Uncategorized";
        public string? Description { get; set; }

        [Column("Image_Url")]
        public string? Image_Url { get; set; }

        [Column("Is_Discontinued")]
        public byte LifecycleStatus { get; set; } = Lifecycle.Active;
    }
}
