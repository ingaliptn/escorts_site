using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Reflection;

namespace escorts_directory.Models
{
    public class escorts
    {
		[Key]
		public int Id { get; set; }
		public string Name { get; set; }
		public int Age { get; set; }
		public string Eyes { get; set; }
		[Column("Hair_color")] 
		public string HairColor { get; set; }
		[Column("Hair_lenght")]
		public string HairLenght { get; set; }
		[Column("Bust_size")]
		public string BustSize { get; set; }
		[Column("Bust_type")]
		public string BustType { get; set; }
		public string WeightKg { get; set; } 
		public string WeightLbs { get; set; } 
		public string HeightCm { get; set; }
		public string HeightInch { get; set; }
		public string Ethnicity { get; set; }
		public string Gender { get; set; }
		[Column("Location_city")]
		public string LocationCity { get; set; }
		[Column("Location_state")]
		public string LocationState { get; set; }
		public string Orientation { get; set; }
		public string Smoker { get; set; }
		public string Tattoo { get; set; }
		public string Nationality { get; set; }
		public string Languages { get; set; }
		[Column("Available_for")]
		public string AvailableFor { get; set; }
		[Column("Meeting_with")]
		public string MeetingWith { get; set; }
		public string? file_name1 { get; set; }
		public string? file_name2 { get; set; }
		public string? file_name3 { get; set; }
		public string? file_name4 { get; set; }
		public string? file_name5 { get; set; }
		public string? file_name6 { get; set; }
		public string? file_name7 { get; set; }
		public string? file_name8 { get; set; }
		public string? file_name9 { get; set; }
		public string? file_name10 { get; set; }
		public string? file_name11 { get; set; }
	}

	}
