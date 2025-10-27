namespace AmusementParkAPI.DTOs
{
    public class CreateReview
    {
        public int Customer_ID { get; set; }
        public int Ride_ID { get; set; }
        public short Rating { get; set; }
        public string Feedback { get; set; } = string.Empty;
        public DateTime Date { get; set; } = DateTime.Now;
    }
}