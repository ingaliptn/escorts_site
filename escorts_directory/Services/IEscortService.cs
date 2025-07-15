using escorts_directory.Models;
      
public interface IEscortService
{
    Task<List<escorts>> GetEscortsAsync();
    Task<escorts> GetEscortByNameAsync(string escortname);
    Task<escorts> GetEscortByIdAsync(int id);
    Task<List<escorts>> GetRandomEscortsAsync(int number);
    Task<inform> GetInfoAsync(string pageLoc);
    Task<phoneNumber> GetPhoneAsync();
	Task<List<string>> GetServicesByEscortIdAsync(int escortId);
    Task<List<escorts>> GetEscortsByLocationAsync(string state, string city);
    Task<List<(string State, string City, int Count)>> GetEscortCitiesAsync();
    Task<escorts> GetEscortBySlugAsync(string city, string name);
}
