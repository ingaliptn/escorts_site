﻿namespace escorts_directory.Models.VM
{
    public class EscortWithPhoto
    {
        public escorts Escort { get; set; }
        public string PhotoUrl { get; set; }
        public List<string> Badges { get; set; } = new();
    }

}
