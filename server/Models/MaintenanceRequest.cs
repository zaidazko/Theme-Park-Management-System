using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AmusementParkAPI.Models
{
    [Table("maintenance_request")]
    public class MaintenanceRequest
    {
        [Key]
        [Column("Request_ID")]
        public int RequestId { get; set; }

        [Column("Ride_ID")]
        public int? RideId { get; set; }

        [Column("Reported_By")]
        public int? ReportedBy { get; set; }

        [Column("Assigned_To")]
        public int? AssignedTo { get; set; }

        [Column("Issue_Description")]
        public string? IssueDescription { get; set; }

        [Column("Request_Date")]
        public DateTime? RequestDate { get; set; }

        [Column("Status")]
        [MaxLength(50)]
        public string? Status { get; set; }

        [Column("Completion_Date")]
        public DateTime? CompletionDate { get; set; }

        // Navigation properties
        [ForeignKey("RideId")]
        public virtual Rides? Ride { get; set; }

        [ForeignKey("ReportedBy")]
        public virtual Employee? Reporter { get; set; }

        [ForeignKey("AssignedTo")]
        public virtual Employee? Assignee { get; set; }
    }
}