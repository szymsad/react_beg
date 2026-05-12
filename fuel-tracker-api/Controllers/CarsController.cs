using FuelTrackerApi.Data;
using FuelTrackerApi.DTOs;
using FuelTrackerApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FuelTrackerApi.Controllers;

[ApiController]
[Route("api/cars")]
public class CarsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<List<CarDto>> GetAll() =>
        (await db.Cars.ToListAsync()).Select(ToDto).ToList();

    [HttpGet("{id}")]
    public async Task<ActionResult<CarDto>> GetById(int id)
    {
        var car = await db.Cars.FindAsync(id);
        return car is null ? NotFound() : ToDto(car);
    }

    [HttpPost]
    public async Task<ActionResult<CarDto>> Create(CreateCarDto dto)
    {
        var car = new Car
        {
            Name = dto.Name,
            Plate = dto.Plate,
            TanksRaw = string.Join(",", dto.Tanks)
        };
        db.Cars.Add(car);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = car.Id }, ToDto(car));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CarDto>> Update(int id, CreateCarDto dto)
    {
        var car = await db.Cars.FindAsync(id);
        if (car is null) return NotFound();
        car.Name = dto.Name;
        car.Plate = dto.Plate;
        car.TanksRaw = string.Join(",", dto.Tanks);
        await db.SaveChangesAsync();
        return Ok(ToDto(car));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var car = await db.Cars.FindAsync(id);
        if (car is null) return NotFound();
        db.Cars.Remove(car);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static CarDto ToDto(Car c) => new(
        c.Id, c.Name, c.Plate,
        c.TanksRaw.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
    );
}