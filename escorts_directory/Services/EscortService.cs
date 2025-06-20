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
}
