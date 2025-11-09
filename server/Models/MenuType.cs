namespace AmusementParkAPI.Models
{
    public class MenuType
    {
        public int MenuType_ID { get; set; }
        public string Food_Name { get; set; } = string.Empty;
        public decimal Base_Price { get; set; }
        public string? Description { get; set; }
        public bool Is_Discontinued { get; set; }
    }
}
