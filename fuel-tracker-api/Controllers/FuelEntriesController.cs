using FuelTrackerApi.Data;
using FuelTrackerApi.DTOs;
using FuelTrackerApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FuelTrackerApi.Controllers;

[ApiController]
[Route("api/entries")]
public class FuelEntriesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<List<FuelEntryDto>> GetAll([FromQuery] int? carId)
    {
        var query = db.FuelEntries.AsQueryable();
        if (carId.HasValue)
            query = query.Where(e => e.CarId == carId.Value);

        return (await query.OrderBy(e => e.Date).ThenBy(e => e.Time).ToListAsync())
            .Select(ToDto).ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FuelEntryDto>> GetById(int id)
    {
        var entry = await db.FuelEntries.FindAsync(id);
        return entry is null ? NotFound() : ToDto(entry);
    }

    [HttpPost]
    public async Task<ActionResult<FuelEntryDto>> Create(CreateFuelEntryDto dto)
    {
        if (!await db.Cars.AnyAsync(c => c.Id == dto.CarId))
            return BadRequest("Auto nie istnieje.");

        var entry = FromDto(dto);
        db.FuelEntries.Add(entry);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entry.Id }, ToDto(entry));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<FuelEntryDto>> Update(int id, CreateFuelEntryDto dto)
    {
        var entry = await db.FuelEntries.FindAsync(id);
        if (entry is null) return NotFound();

        entry.FuelType = dto.FuelType;
        entry.FuelVariant = dto.FuelVariant;
        entry.Date = dto.Date;
        entry.Time = dto.Time;
        entry.Liters = dto.Liters;
        entry.PricePerLiter = dto.PricePerLiter;
        entry.TotalCost = dto.TotalCost;
        entry.Mileage = dto.Mileage;
        entry.IsFullTank = dto.IsFullTank;
        entry.TankLevelAfter = dto.TankLevelAfter;
        entry.MissedPreviousRefuel = dto.MissedPreviousRefuel;
        entry.KmOnPetrol = dto.KmOnPetrol;
        entry.Note = dto.Note;

        await db.SaveChangesAsync();
        return Ok(ToDto(entry));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entry = await db.FuelEntries.FindAsync(id);
        if (entry is null) return NotFound();
        db.FuelEntries.Remove(entry);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static FuelEntry FromDto(CreateFuelEntryDto d) => new()
    {
        CarId = d.CarId,
        FuelType = d.FuelType,
        FuelVariant = d.FuelVariant,
        Date = d.Date,
        Time = d.Time,
        Liters = d.Liters,
        PricePerLiter = d.PricePerLiter,
        TotalCost = d.TotalCost,
        Mileage = d.Mileage,
        IsFullTank = d.IsFullTank,
        TankLevelAfter = d.TankLevelAfter,
        MissedPreviousRefuel = d.MissedPreviousRefuel,
        KmOnPetrol = d.KmOnPetrol,
        Note = d.Note
    };

    private static FuelEntryDto ToDto(FuelEntry e) => new(
     e.Id, e.CarId, e.FuelType, e.FuelVariant, e.Date, e.Time,
     e.Liters, e.PricePerLiter, e.TotalCost, e.Mileage,
     e.IsFullTank, e.TankLevelAfter, e.MissedPreviousRefuel,
     e.KmOnPetrol, e.Note
 );
}