using System.ComponentModel.DataAnnotations.Schema;

namespace AmusementParkAPI.Models
{
    public class Reviews
    {
        public int Review_ID { get; set; }
        public DateTime Date { get; set; }
        public short Score { get; set; }
        public string Feedback { get; set; } = string.Empty;
        [Column("Ride_ID")]
        public int Ride_ID { get; set; }
        [ForeignKey("Ride_ID")]
        public Rides? Ride { get; set; }
        [Column("Customer_ID")]
        public int Customer_ID { get; set; }
        [ForeignKey("Customer_ID")]
        public Customer? Customer { get; set; }
    }
}