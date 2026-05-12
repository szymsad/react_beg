namespace FuelTrackerApi.DTOs;

public record CarDto(int Id, string Name, string? Plate, List<string> Tanks);
public record CreateCarDto(string Name, string? Plate, List<string> Tanks);