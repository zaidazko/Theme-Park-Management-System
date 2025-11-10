namespace AmusementParkAPI.DTOs
{
    public class LoginResponse
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string UserType { get; set; } = string.Empty;
        public int? CustomerId { get; set; }
        public int? EmployeeId { get; set; }
        public string Message { get; set; } = string.Empty;
        
        // User info (Customer or Employee)
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }

        // Role info (for employees)
        public int? RoleId { get; set; }
        public string? RoleName { get; set; }
    }
}