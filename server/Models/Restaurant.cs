using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AmusementParkAPI.Models
{
    [Table("restaurant")]
    public class Restaurant
    {
        [Key]
        [Column("Restaurant_ID")]
        public int Restaurant_ID { get; set; }

        [Column("Restaurant_Name")]
        [MaxLength(100)]
        public string Restaurant_Name { get; set; } = string.Empty;

        [Column("Location")]
        [MaxLength(100)]
        public string? Location { get; set; }

        [Column("Cuisine_Type")]
        [MaxLength(50)]
        public string? Cuisine_Type { get; set; }

        [Column("Opening_Time")]
        public TimeSpan? Opening_Time { get; set; }

        [Column("Closing_Time")]
        public TimeSpan? Closing_Time { get; set; }
    }
}