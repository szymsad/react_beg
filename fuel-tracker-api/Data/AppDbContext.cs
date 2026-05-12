using FuelTrackerApi.Models;
using Microsoft.EntityFrameworkCore;

namespace FuelTrackerApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Car> Cars => Set<Car>();
    public DbSet<FuelEntry> FuelEntries => Set<FuelEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Car>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.TanksRaw).HasColumnName("Tanks");
        });

        modelBuilder.Entity<FuelEntry>(e =>
        {
            e.HasKey(f => f.Id);
            e.HasOne(f => f.Car)
             .WithMany(c => c.Entries)
             .HasForeignKey(f => f.CarId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed — przykładowe auta
        modelBuilder.Entity<Car>().HasData(
            new Car { Id = 1, Name = "Audi A4 B6 1.8T", Plate = "WA 12345", TanksRaw = "petrol,lpg" },
            new Car { Id = 2, Name = "Toyota Yaris 1.3", Plate = "KR 99887", TanksRaw = "petrol" },
            new Car { Id = 3, Name = "BMW E91 320d", Plate = "GD 4455K", TanksRaw = "diesel" }
        );
    }
}