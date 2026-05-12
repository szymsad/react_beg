namespace FuelTrackerApi.Models;

public class Car
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Plate { get; set; }
    public string TanksRaw { get; set; } = "petrol";

    public ICollection<FuelEntry> Entries { get; set; } = [];
}