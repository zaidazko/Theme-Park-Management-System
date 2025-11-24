using System.ComponentModel.DataAnnotations.Schema;
using Lifecycle = AmusementParkAPI.Models.LifecycleStatus;

namespace AmusementParkAPI.Models
{
    public class MenuType
    {
        public int MenuType_ID { get; set; }
        public string Food_Name { get; set; } = string.Empty;
        public decimal Base_Price { get; set; }
        public string? Description { get; set; }

        [Column("Image_Url")]
        public string? Image_Url { get; set; }

    [Column("Is_Discontinued")]
    public byte LifecycleStatus { get; set; } = Lifecycle.Active;
    }
}
