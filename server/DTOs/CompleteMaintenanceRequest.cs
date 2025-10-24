using System.ComponentModel.DataAnnotations;

namespace AmusementParkAPI.DTOs
{
    public class CompleteMaintenanceRequest
    {
        [Required]
        public string WorkDetails { get; set; } = string.Empty;
    }
}
