using System.ComponentModel.DataAnnotations;

namespace AmusementParkAPI.DTOs
{
    public class CreateMaintenanceRequestRequest
    {
        [Required]
        public int RideId { get; set; }

        [Required]
        public int ReportedBy { get; set; }

        [Required]
        [MinLength(10)]
        [MaxLength(1000)]
        public string IssueDescription { get; set; } = string.Empty;
    }
}
