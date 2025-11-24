using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AmusementParkAPI.Models
{
    [Table("ride")]
    public class Rides
    {

        [Key]
        [Column("Ride_ID")]
        public int Ride_ID { get; set; }

        [Column("Ride_Name")]
        public string Ride_Name { get; set; } = string.Empty;

        [Column("Capacity")]
        public int Capacity { get; set; }

        [Column("Status")]
        public string Status { get; set; } = string.Empty;

        [Column("Image")]
        public string Image { get; set; } = string.Empty;

        [Column("Description")]
        public string Description { get; set; } = string.Empty;

        [Column("Height_Requirement")]
        public int? Height_Requirement {get; set;}

    }

}