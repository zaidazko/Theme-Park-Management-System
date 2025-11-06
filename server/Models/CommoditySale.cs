namespace AmusementParkAPI.Models
{
    public class CommoditySale
    {
        public int Commodity_SaleID { get; set; }
        public int Customer_ID { get; set; }
        public DateTime Purchase_Date { get; set; }
        public int Commodity_TypeID { get; set; }
        public int Quantity { get; set; } = 1;
        public decimal Price { get; set; }
        public string Payment_Method { get; set; } = "credit";
    }
}