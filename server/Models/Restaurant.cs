namespace AmusementParkAPI.Models
{
    public class Restaurant
    {
        public int Menu_ID { get; set; }
        public string Menu_Name { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Restaurant_ID { get; set; }
    }
}