using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AmusementParkAPI.Models
{
    [Table("employees")]
    public class Employee
    {
        [Key]
        [Column("Employee_ID")]
        public int EmployeeId { get; set; }

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

        [Column("Hire_Date")]
        public DateTime? HireDate { get; set; }

        [Column("Salary")]
        public decimal? Salary { get; set; }

        [Column("Department_ID")]
        public int? DepartmentId { get; set; }

        [Column("Role_ID")]
        public int? RoleId { get; set; }

        // Navigation properties
        [ForeignKey("DepartmentId")]
        public virtual Department? Department { get; set; }

        [ForeignKey("RoleId")]
        public virtual Role? Role { get; set; }
    }
}
