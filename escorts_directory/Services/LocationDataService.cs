namespace escorts_directory.Services
{
    public class LocationDataService
    {
        public Dictionary<string, List<string>> GetCitiesByState() => new()
        {
            ["New York"] = new() { "New York City" },
            ["California"] = new() { "Los Angeles", "San Diego", "San Jose", "San Francisco", "Fresno", "Sacramento" },
            ["Texas"] = new() { "Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso" },
            ["Florida"] = new() { "Jacksonville" },
            ["Arizona"] = new() { "Phoenix", "Tucson" },
            ["Illinois"] = new() { "Chicago" },
            ["Pennsylvania"] = new() { "Philadelphia" },
            ["Ohio"] = new() { "Columbus" },
            ["North Carolina"] = new() { "Charlotte" },
            ["Indiana"] = new() { "Indianapolis" },
            ["Washington"] = new() { "Seattle" },
            ["Colorado"] = new() { "Denver" },
            ["Oklahoma"] = new() { "Oklahoma City" },
            ["Tennessee"] = new() { "Nashville", "Memphis" },
            ["District of Columbia"] = new() { "Washington, D.C." },
            ["Nevada"] = new() { "Las Vegas" },
            ["Massachusetts"] = new() { "Boston" },
            ["Michigan"] = new() { "Detroit" },
            ["Oregon"] = new() { "Portland" },
            ["Maryland"] = new() { "Baltimore" },
            ["New Mexico"] = new() { "Albuquerque" },
            ["Georgia"] = new() { "Atlanta" }
        };

        public List<string> GetStates() => GetCitiesByState().Keys.OrderBy(x => x).ToList();

        public List<string> GetGenders() => new() { "Female", "Male" };

        public List<string> GetCitiesForState(string state)
        {
            var dict = GetCitiesByState();
            return dict.ContainsKey(state) ? dict[state] : new List<string>();
        }
    }

}
