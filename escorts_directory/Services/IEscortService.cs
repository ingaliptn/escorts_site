using escorts_directory.Models;
      
public interface IEscortService
{
    Task<List<escorts>> GetEscortsAsync();
    Task<escorts> GetEscortByNameAsync(string escortname);
    Task<escorts> GetEscortByIdAsync(int id);
    Task<List<escorts>> GetRandomEscortsAsync(int number);
    Task<inform> GetInfoAsync(string pageLoc);
    Task<phoneNumber> GetPhoneAsync();
}
