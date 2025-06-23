namespace escorts_directory.Models.VM
{
    public class SearchFilterViewModel
    {
        public string? SelectedState { get; set; }
        public string? SelectedCity { get; set; }
        public string? SelectedGender { get; set; }

        public List<string> States { get; set; } = new();
        public List<string> Cities { get; set; } = new();
        public List<string> Genders { get; set; } = new();

        // Результати пошуку
        public List<EscortWithPhoto> Results { get; set; } = new();
    }

}
