using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AmusementParkAPI.Models
{
    [Table("role")]
    public class Role
    {
        [Key]
        [Column("Role_ID")]
        public int RoleId { get; set; }

        [Column("Role_Name")]
        [MaxLength(100)]
        public string? RoleName { get; set; }

        [Column("Description")]
        [MaxLength(500)]
        public string? Description { get; set; }

        // Navigation property for employees with this role
        public virtual ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }
}
