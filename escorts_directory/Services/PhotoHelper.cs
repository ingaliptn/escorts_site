namespace escorts_directory.Services
{
    public class PhotoHelper
    {
        private readonly IWebHostEnvironment _env;

        public PhotoHelper(IWebHostEnvironment env)
        {
            _env = env;
        }

        public string GetProfilePhoto(string name, int id, int index = 1)
        {
            var baseName = $"{name}_{id}_{index}";
            var path = Path.Combine(_env.WebRootPath, "images", "Profiles", name); // if photos in folder named like Name
            var extensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };

            foreach (var ext in extensions)
            {
                var fullPath = Path.Combine(path, baseName + ext);
                if (System.IO.File.Exists(fullPath))
                {
                    return $"/images/Profiles/{name}/{baseName}{ext}";
                }
            }

            return "/images/no-image.jpg"; // fallback
        }
    }

}
