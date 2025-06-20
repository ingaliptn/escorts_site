using escorts_directory.Models;
using escorts_directory.Models.VM;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using System.Diagnostics;

namespace escorts_directory.Controllers
{
    public class HomeController : Controller
    {
		private readonly IEscortService _escortService;
		private readonly IMemoryCache _cache;

		public HomeController(IEscortService escortService, IMemoryCache cache)
		{
			_escortService = escortService;
			_cache = cache;
		}

		// ћетод дл€ отриманн€ закешованого номеру телефону
		public async Task<phoneNumber> GetCachedPhoneAsync()
		{
			if (!_cache.TryGetValue("PhoneNumber", out phoneNumber phoneNum))
			{
				// якщо немаЇ в кеш≥, отримуЇмо з бази даних через серв≥с
				phoneNum = await _escortService.GetPhoneAsync();

				//  ешуЇмо на 10 хвилин
				_cache.Set("PhoneNumber", phoneNum, TimeSpan.FromMinutes(10));
			}

			// ѕовертаЇмо закешований (або новий) результат
			return phoneNum;
		}

		// ћетод дл€ встановленн€ загальних даних ViewBag
		private async Task SetCommonViewDataAsync(string pageLoc)
		{
			var phoneNum = await GetCachedPhoneAsync(); // ¬икористовуЇмо кешований телефонний номер
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
            var chunk = escorts.Skip(skip).Take(take).ToList();

            return PartialView("_EscortCardsPartial", chunk);
        }

        public async Task<IActionResult> index()
        {
			var escorts = await _escortService.GetEscortsAsync();

			// ѕерш≥ 4 Ч велик≥, решта Ч мал≥
			var top4 = escorts.Take(4).ToList();
			var others = escorts.Skip(4).ToList();

			var model = new EscortsViewModel
			{
				Featured = top4,
				Regular = others
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
