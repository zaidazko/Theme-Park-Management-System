using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace AmusementParkAPI.Models
{
    [Table("maintenance_log")]
    public class MaintenanceLog
    {
        [Key]
        [Column("Log_ID")]
        public int LogId { get; set; }

        [Column("Request_ID")]
        public int RequestId { get; set; }

        [Column("Ride_ID")]
        public int? RideId { get; set; }

        [Column("Performed_By")]
        public int PerformedBy { get; set; }

        [Column("Work_Details")]
        public string WorkDetails { get; set; } = string.Empty;

        [Column("Date_Performed")]
        public DateTime DatePerformed { get; set; }

        // Navigation properties
        [ForeignKey("RequestId")]
        [JsonIgnore] // Prevent circular reference in JSON serialization
        public virtual MaintenanceRequest? MaintenanceRequest { get; set; }

        [ForeignKey("RideId")]
        [JsonIgnore] // Prevent circular reference - we don't need this in the response
        public virtual Rides? Ride { get; set; }

        [ForeignKey("PerformedBy")]
        [JsonIgnore] // Prevent circular reference - we don't need this in the response
        public virtual Employee? PerformedByEmployee { get; set; }
    }
}
