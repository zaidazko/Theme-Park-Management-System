using System.ComponentModel.DataAnnotations.Schema;
using Lifecycle = AmusementParkAPI.Models.LifecycleStatus;

namespace AmusementParkAPI.Models
{
    public class TicketType
    {
        public int TicketType_ID { get; set; }
        public string Type_Name { get; set; } = string.Empty;
        public decimal Base_Price { get; set; }
        public int Ride_ID { get; set; }
        public string? Description { get; set; }
    [Column("Is_Discontinued")]
    public byte LifecycleStatus { get; set; } = Lifecycle.Active;
        public Rides? Ride { get; set; }
    }
}