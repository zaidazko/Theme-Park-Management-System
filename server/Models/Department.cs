using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AmusementParkAPI.Models
{
    [Table("department")]
    public class Department
    {
        [Key]
        [Column("Department_ID")]
        public int DepartmentId { get; set; }

        [Column("Department_Name")]
        [MaxLength(100)]
        public string? DepartmentName { get; set; }

        // Navigation property for employees in this department

        public virtual ICollection<Employee> Employees { get; set; } = new List<Employee>();

    }
}
