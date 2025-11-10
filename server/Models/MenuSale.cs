using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AmusementParkAPI.Models
{
    [Table("menu_sale")]
    public class MenuSale
    {
        [Key]
        [Column("Menu_ID")]
        public int Menu_ID { get; set; }

        [Column("Customer_ID")]
        public int Customer_ID { get; set; }

        [Column("MenuType_ID")]
        public int MenuType_ID { get; set; }

        [Column("Purchase_Date")]
        public DateTime? Purchase_Date { get; set; }

        [Column("Price")]
        public decimal Price { get; set; }

        [Column("Payment_Method")]
        [MaxLength(50)]
        public string Payment_Method { get; set; } = "credit";

        [Column("Quantity")]
        public int Quantity { get; set; } = 1;
    }
}
