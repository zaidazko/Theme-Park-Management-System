using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AmusementParkAPI.Models
{
    [Table("menu_item")]
    public class MenuItem
    {
        [Key]
        [Column("Menu_ID")]
        public int Menu_ID { get; set; }

        [Column("Restaurant_ID")]
        public int Restaurant_ID { get; set; }

        [Column("Item_Name")]
        [MaxLength(100)]
        public string Item_Name { get; set; } = string.Empty;

        [Column("Item_Description")]
        [MaxLength(255)]
        public string? Item_Description { get; set; }

    [Column("Image_Url")]
    [MaxLength(500)]
    public string? Image_Url { get; set; }

        [Column("Price")]
        public decimal Price { get; set; }

        [Column("Category")]
        [MaxLength(20)]
        public string Category { get; set; } = string.Empty;

        [Column("Available")]
        public bool Available { get; set; } = true;
    }
}