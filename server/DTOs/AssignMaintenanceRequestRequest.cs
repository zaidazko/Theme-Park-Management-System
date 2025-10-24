using System.ComponentModel.DataAnnotations;

namespace AmusementParkAPI.DTOs
{
    public class AssignMaintenanceRequestRequest
    {
        [Required]
        public int AssignedTo { get; set; }
    }
}
