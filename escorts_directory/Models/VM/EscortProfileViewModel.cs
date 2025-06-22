namespace escorts_directory.Models.VM
{
	public class EscortProfileViewModel
	{
		public escorts Escort { get; set; }
		public int PhotoCount { get; set; } = 5;
		public List<string> Services { get; set; }
		public List<EscortWithPhoto> RandomEscorts { get; set; }
	}

}
