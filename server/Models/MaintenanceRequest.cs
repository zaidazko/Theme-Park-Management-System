using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AmusementParkAPI.Models
{
    [Table("maintenance_request")]
    public class MaintenanceRequest
    {
        [Key]
        [Column("request_id")]
        public int RequestId { get; set; }

        [Column("ride_id")]
        public int RideId { get; set; }

        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [Column("status")]
        public string Status { get; set; } = "awaiting";

        [Column("assigned_to")]
        public int? AssignedTo { get; set; }

        [Column("completion_date")]
        public DateTime? CompletionDate { get; set; }

        [Column("request_date")]
        public DateTime RequestDate { get; set; } = DateTime.Now;

        [Column("requester_id")]
        public int RequesterId { get; set; }

        // Navigation properties
        [ForeignKey("RideId")]
        public virtual Rides Ride { get; set; } = null!;

        [ForeignKey("AssignedTo")]
        public virtual Employee? AssignedEmployee { get; set; }

        [ForeignKey("RequesterId")]
        public virtual UserLogin Requester { get; set; } = null!;
    }
}
