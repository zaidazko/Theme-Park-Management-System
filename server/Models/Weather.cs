using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AmusementParkAPI.Models
{
    [Table("weather")]
    public class Weather
    {
        [Key]
        [Column("weather_id")]
        public int WeatherId { get; set; }

        [Column("weather_condition")]
        [MaxLength(50)] // Enum strings are stored as strings in EF Core by default unless converted
        public string WeatherCondition { get; set; } = "Regular";

        [Column("weather_date")]
        public DateTime WeatherDate { get; set; }
    }
}

