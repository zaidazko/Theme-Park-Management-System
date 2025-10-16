using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AmusementParkAPI.Models
{
    [Table("user_login")]
    public class UserLogin
    {
        [Key]
        [Column("User_ID")]
        public int UserId { get; set; }

        [Column("Employee_ID")]
        public int? EmployeeId { get; set; }

        [Column("Customer_ID")]
        public int? CustomerId { get; set; }

        [Column("User_Type")]
        [MaxLength(50)]
        public string? UserType { get; set; }

        [Column("Username")]
        [MaxLength(50)]
        [Required]
        public string Username { get; set; } = string.Empty;

        [Column("Password")]
        [MaxLength(255)]
        [Required]
        public string Password { get; set; } = string.Empty;

        [Column("Last_Login")]
        public DateTime? LastLogin { get; set; }

        // Navigation property
        [ForeignKey("CustomerId")]
        public Customer? Customer { get; set; }
    }
}