namespace escorts_directory.Services
{
    public static class SlugHelper
    {
        public static string ToSlug(this string text)
        {
            return text.ToLower().Replace(" ", "-");
        }
    }

}
