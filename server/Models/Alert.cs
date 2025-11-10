using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AmusementParkAPI.Models
{
    [Table("alerts")]
    public class Alert
    {
        [Key]
        [Column("Alert_ID")]
        public int AlertId { get; set; }

        [Column("Priority_Type")]
        [MaxLength(50)]
        public string? PriorityType { get; set; }

        // Navigation property to MaintenanceRequest (one-to-many: one alert can have many maintenance requests)
        public virtual ICollection<MaintenanceRequest>? MaintenanceRequests { get; set; }
    }
}

