using escorts_directory.Models;

public class EscortServiceEntry
{
    public int Id { get; set; }
    public int EscortId { get; set; }
    public int ServiceId { get; set; }
    public bool IsIncluded { get; set; }

    public Service Service { get; set; } // зв'язок із таблицею Services
}
