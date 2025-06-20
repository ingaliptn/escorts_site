namespace escorts_directory.Models
{
    public class LogicModel
    {
        public string Smtp { get; set; } = "sp-vm.serverpipe.org";
        public int Port { get; set; } = 587;
        public bool IsEnableSsl { get; set; } = true;
        public bool IsUseDefaultCredentials { get; set; }
        public string Login { get; set; } = "relay@serverpipe.org";
        public string Email { get; set; } = "relay@serverpipe.org";
        public string Password { get; set; } = "Z326050r@";
        public string FromName { get; set; } = "ORLANDO VENUS ESCORTS";
        public string FromEmail { get; set; } = "relay@serverpipe.org";
        public string ToEmail { get; set; } = "bookings@usescortagency.com, support@usescortagency.com";
        public string? Subject { get; set; }
        public string? Body { get; set; }


        //'bookings@usescortagency.com');
        //'support@usescortagency.com');

    }
    public class ContactUsModel
    {
        public string? ContactFullName { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public string? ContactSubject { get; set; }
        public string? ContactMessage { get; set; }

    }

    public class BuyNowModel
    {
        public string? BuyEscortname { get; set; }
        public string? BuyEscortname1 { get; set; }
        public string? BuyFirstName { get; set; }
        public string? BuyLastName { get; set; }
        public string? BuyHotelName { get; set; }
        public string? BuyHotelRoom { get; set; }
        public string? BuyEmail { get; set; }
        public string? BuyPhone { get; set; }
        public string? BuyRequest { get; set; }
    }
    public class JoinFormModel
    {
        public string? JoinFirstName { get; set; }
        public string? JoinLastName { get; set; }
        public int? JoinAge { get; set; }
        public string? JoinEmail { get; set; }
        public string? JoinPhone { get; set; }
        public string? JoinShortDescription { get; set; }
        public string? JoinNationality { get; set; }
        public string? JoinHeight { get; set; }
        public string? JoinWeight { get; set; }

        public IFormFile? JoinImageFile { get; set; }
    }
}
