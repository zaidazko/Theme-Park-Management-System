namespace AmusementParkAPI.Models
{
    public class TicketSale
    {
        public int Ticket_ID { get; set; }
        public int Customer_ID { get; set; }
        public DateTime Purchase_Date { get; set; }
        public int TicketType_ID { get; set; }
        public decimal Price { get; set; }
        public string Payment_Method { get; set; } = "credit";
    }
}