using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AmusementParkAPI.Models
{
    [Table("commodity_sale")]
    public class CommoditySale
    {
        [Key]
        [Column("Commodity_SaleID")]
        public int Commodity_SaleID { get; set; }

        [Column("Customer_ID")]
        public int Customer_ID { get; set; }

        [Column("Purchase_Date")]
        public DateTime? Purchase_Date { get; set; }

        [Column("Commodity_TypeID")]
        public int Commodity_TypeID { get; set; }

        [Column("Price")]
        public decimal Price { get; set; }

        [Column("Payment_Method")]
        [MaxLength(50)]
        public string Payment_Method { get; set; } = "credit";

        [Column("Quantity")]
        public int Quantity { get; set; } = 1;
    }
}