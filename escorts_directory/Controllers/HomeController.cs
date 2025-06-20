using escorts_directory.Models;
using escorts_directory.Models.VM;
using escorts_directory.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System.Diagnostics;

namespace escorts_directory.Controllers
{
    public class HomeController : Controller
    {
		private readonly IEscortService _escortService;
        private readonly IMemoryCache _cache;
        private readonly PhotoHelper _photoHelper;
        public HomeController(IEscortService escortService, IMemoryCache cache, PhotoHelper photoHelper)
        {
            _escortService = escortService;
            _cache = cache;
            _photoHelper = photoHelper;
        }

        // Метод для отримання закешованого номеру телефону
        public async Task<phoneNumber> GetCachedPhoneAsync()
		{
			if (!_cache.TryGetValue("PhoneNumber", out phoneNumber phoneNum))
			{
				// Якщо немає в кеші, отримуємо з бази даних через сервіс
				phoneNum = await _escortService.GetPhoneAsync();

				// Кешуємо на 10 хвилин
				_cache.Set("PhoneNumber", phoneNum, TimeSpan.FromMinutes(10));
			}

			// Повертаємо закешований (або новий) результат
			return phoneNum;
		}

		// Метод для встановлення загальних даних ViewBag
		private async Task SetCommonViewDataAsync(string pageLoc)
		{
			var phoneNum = await GetCachedPhoneAsync(); // Використовуємо кешований телефонний номер
			ViewBag.PhoneShow = phoneNum.phoneShow;
			ViewBag.PhoneCall = phoneNum.phoneCall;
			ViewBag.Email = phoneNum.email;

			var pageInfo = await _escortService.GetInfoAsync(pageLoc);
			ViewBag.Title = pageInfo.titleText;
			ViewBag.Desc = pageInfo.descText;
			ViewBag.Canonical = pageInfo.canonicalText;
			ViewBag.Robots = pageInfo.robotsText;
			ViewBag.bannerimg = pageInfo.headerText;
			ViewBag.banner = pageInfo.bodyText;
			ViewBag.Page = pageInfo.pageLocation;
		}

        [HttpGet]
        public async Task<IActionResult> LoadMoreEscorts(int skip = 0, int take = 12)
        {
            var escorts = await _escortService.GetEscortsAsync();
            var chunk = escorts
                .Skip(skip)
                .Take(take)
                .Select(e => new EscortWithPhoto
                {
                    Escort = e,
                    PhotoUrl = _photoHelper.GetProfilePhoto(e.Name, e.Id)
                })
                .ToList();

            return PartialView("_EscortCardsPartial", chunk);
        }


        public async Task<IActionResult> index()
        {
            var escorts = await _escortService.GetEscortsAsync();

            var escortsWithPhoto = escorts
                .Select(e => new EscortWithPhoto
                {
                    Escort = e,
                    PhotoUrl = _photoHelper.GetProfilePhoto(e.Name, e.Id)
                })
                .ToList();

            var model = new EscortsViewModel
            {
                Featured = escortsWithPhoto.Take(4).ToList(),
                Regular = escortsWithPhoto.Skip(4).ToList()
            };

            return View(model);
        }
        public IActionResult about_us()
        {
            return View();
        }
        public IActionResult category_page()
        {
            return View();
        }
        public IActionResult common_page()
        {
            return View();
        }
        public IActionResult contact_us()
        {
            return View();
        }
        public IActionResult create_account()
        {
            return View();
        }
        public IActionResult model_profile()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
