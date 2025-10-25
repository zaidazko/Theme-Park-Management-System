using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AmusementParkAPI.Models
{
    [Table("restaurant_order")]
    public class RestaurantOrder
    {
        [Key]
        [Column("Order_ID")]
        public int Order_ID { get; set; }

        [Column("Customer_ID")]
        public int Customer_ID { get; set; }

        [Column("Restaurant_ID")]
        public int Restaurant_ID { get; set; }

        [Column("Order_Date")]
        public DateTime Order_Date { get; set; }

        [Column("Total_Price")]
        public decimal Total_Price { get; set; }

        [Column("Payment_Method")]
        [MaxLength(20)]
        public string Payment_Method { get; set; } = "credit";

        [Column("Order_Status")]
        [MaxLength(20)]
        public string Order_Status { get; set; } = "Completed";
    }
}