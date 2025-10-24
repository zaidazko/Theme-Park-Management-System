namespace AmusementParkAPI.Models
{
    public class Reviews
    {
        public int Review_ID { get; set; }
        public DateTime Date { get; set; }
        public short Rating { get; set; }
        public string Feedback { get; set; } = string.Empty;
        public int? Ride_ID { get; set; }
        public Rides? Ride { get; set; }
        public int? Customer_ID { get; set; }
        public Customer? Customer { get; set; }
    }
}