namespace AmusementParkAPI.DTOs
{
    public class LoginResponse
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string UserType { get; set; } = string.Empty;
        public int? CustomerId { get; set; }
        public string Message { get; set; } = string.Empty;
        
        // Customer info
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
    }
}