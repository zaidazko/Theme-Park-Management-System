using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AmusementParkAPI.Models
{
    [Table("order_item")]
    public class OrderItem
    {
        [Key]
        [Column("Order_Item_ID")]
        public int Order_Item_ID { get; set; }

        [Column("Order_ID")]
        public int Order_ID { get; set; }

        [Column("Menu_ID")]
        public int Menu_ID { get; set; }

        [Column("Quantity")]
        public int Quantity { get; set; } = 1;

        [Column("Item_Price")]
        public decimal Item_Price { get; set; }
    }
}