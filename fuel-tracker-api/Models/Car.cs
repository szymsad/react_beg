namespace FuelTrackerApi.Models;

public class Car
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Make { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public int Year { get; set; } = 1990;
    public string? Plate { get; set; }
    public string TanksRaw { get; set; } = "petrol";

    public ICollection<FuelEntry> Entries { get; set; } = [];
}