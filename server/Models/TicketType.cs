namespace AmusementParkAPI.Models
{
    public class TicketType
    {
        public int TicketType_ID { get; set; }
        public string Type_Name { get; set; } = string.Empty;
        public decimal Base_Price { get; set; }
    }
}