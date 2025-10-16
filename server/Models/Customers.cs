using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AmusementParkAPI.Models
{
    [Table("customers")]
    public class Customer
    {
        [Key]
        [Column("Customer_ID")]
        public int CustomerId { get; set; }

        [Column("First_Name")]
        [MaxLength(50)]
        public string? FirstName { get; set; }

        [Column("Last_Name")]
        [MaxLength(50)]
        public string? LastName { get; set; }

        [Column("Email")]
        [MaxLength(100)]
        public string? Email { get; set; }

        [Column("Phone")]
        [MaxLength(20)]
        public string? Phone { get; set; }

        [Column("Date_Of_Birth")]
        public DateTime? DateOfBirth { get; set; }

        [Column("Created_At")]
        public DateTime? CreatedAt { get; set; }
    }
}