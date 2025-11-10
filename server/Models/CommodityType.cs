namespace AmusementParkAPI.Models
{
    public class CommodityType
    {
        public int Commodity_TypeID { get; set; }
        public string Commodity_Name { get; set; } = string.Empty;
        public decimal Base_Price { get; set; }
        public int Commodity_Store { get; set; }
        public int Stock_Quantity { get; set; } = 0;
        public string Category { get; set; } = "merchandise";
        public string Display_Category { get; set; } = "Uncategorized";
        public string? Description { get; set; }
        public bool Is_Discontinued { get; set; } = false;
    }
}
