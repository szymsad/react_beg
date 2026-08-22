namespace FuelTrackerApi.Models;

public class FuelEntry
{
    public int Id { get; set; }
    public int CarId { get; set; }
    public Car Car { get; set; } = null!;

    public string FuelType { get; set; } = "petrol";
    public string? FuelVariant { get; set; }
    public string Date { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public double Liters { get; set; }
    public double PricePerLiter { get; set; }
    public double TotalCost { get; set; }
    public int Mileage { get; set; }
    public bool IsFullTank { get; set; }
    public double? TankLevelAfter { get; set; }
    public bool MissedPreviousRefuel { get; set; }
    public double? KmOnPetrol { get; set; }
    public string? Note { get; set; }
}