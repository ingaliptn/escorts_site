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

		public string GetProfilePhotoByIndex(string name, int id, int index)
		{
			var basePath = Path.Combine(_env.WebRootPath, "images", "Profiles", name);
			var baseName = $"{name}_{id}_{index}";
			var extensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };

			foreach (var ext in extensions)
			{
				var fullPath = Path.Combine(basePath, baseName + ext);
				if (System.IO.File.Exists(fullPath))
				{
					return $"/images/Profiles/{name}/{baseName}{ext}";
				}
			}

			return "/images/no-image.jpg";
		}

		public int GetPhotoCount(string name, int id)
		{
			var basePath = Path.Combine(_env.WebRootPath, "images", "Profiles", name);
			var baseName = $"{name}_{id}_";
			var extensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };

			if (!Directory.Exists(basePath))
				return 0;

			var count = 0;
			for (int i = 1; i <= 11; i++) // максимум 20 фото
			{
				bool exists = extensions.Any(ext =>
					System.IO.File.Exists(Path.Combine(basePath, $"{baseName}{i}{ext}")));

				if (exists)
					count++;
				else
					break;
			}

			return count;
		}


	}

}
