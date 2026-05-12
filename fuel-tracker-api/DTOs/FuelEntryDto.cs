namespace FuelTrackerApi.DTOs;

public record FuelEntryDto(
    int Id, int CarId, string FuelType, string Date, string Time,
    double Liters, double PricePerLiter, double TotalCost, int Mileage,
    bool IsFullTank, double? TankLevelAfter, bool MissedPreviousRefuel,
    double? KmOnPetrol, string? Note
);

public record CreateFuelEntryDto(
    int CarId, string FuelType, string Date, string Time,
    double Liters, double PricePerLiter, double TotalCost, int Mileage,
    bool IsFullTank, double? TankLevelAfter, bool MissedPreviousRefuel,
    double? KmOnPetrol, string? Note
);