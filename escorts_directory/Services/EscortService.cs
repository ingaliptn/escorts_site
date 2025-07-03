using escorts_directory.Context;
using escorts_directory.Models;
using Microsoft.EntityFrameworkCore;
using static System.Runtime.InteropServices.JavaScript.JSType;

public class EscortService : IEscortService
{
    private readonly AppDbContext _db;
    public EscortService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<escorts>> GetEscortsAsync()
    {
        return await _db.escorts.ToListAsync();
    }

    public async Task<escorts> GetEscortByNameAsync(string escortname)
    {
        return await _db.escorts.FirstOrDefaultAsync(e => e.Name == escortname.ToLower());

    }
    public async Task<escorts> GetEscortByIdAsync(int id)
    {
        return await _db.escorts.FirstOrDefaultAsync(e => e.Id == id);

    }

    public async Task<List<escorts>> GetRandomEscortsAsync(int number)
    {
        return await _db.escorts.OrderBy(x => Guid.NewGuid()).Take(number).ToListAsync();
    }

    public async Task<inform> GetInfoAsync(string pageLoc)
    {
        return await _db.inform.FirstOrDefaultAsync(lp => lp.pageLocation == pageLoc);
    }

    public async Task<phoneNumber> GetPhoneAsync()
    {
        return await _db.phoneNumber.FirstOrDefaultAsync();
    }
    public async Task<List<string>> GetServicesByEscortIdAsync(int escortId)
    {
        return await _db.EscortServices
            .Include(es => es.Service)
            .Where(es => es.EscortId == escortId && es.IsIncluded)
            .Select(es => es.Service.Name)
            .ToListAsync();
    }

    public async Task<List<escorts>> GetEscortsByLocationAsync(string state, string city)
    {
        var normalizedState = state.Replace("-", " ", StringComparison.OrdinalIgnoreCase);
        var normalizedCity = city.Replace("-", " ", StringComparison.OrdinalIgnoreCase);

        return await _db.escorts
            .Where(e =>
                e.LocationState.ToLower() == normalizedState.ToLower() &&
                e.LocationCity.ToLower() == normalizedCity.ToLower())
            .ToListAsync();
    }
	public async Task<List<(string State, string City, int Count)>> GetEscortCitiesAsync()
	{
		return await _db.escorts
			.GroupBy(e => new { e.LocationState, e.LocationCity })
			.Select(g => new ValueTuple<string, string, int>(
				g.Key.LocationState,
				g.Key.LocationCity,
				g.Count()
			))
			.OrderByDescending(x => x.Item3)
			.ToListAsync();
	}


}
