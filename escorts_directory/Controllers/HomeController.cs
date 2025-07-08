using escorts_directory.Models;
using escorts_directory.Models.VM;
using escorts_directory.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

		// ����� ��� ��������� ������������ ������ ��������
		public async Task<phoneNumber> GetCachedPhoneAsync()
		{
			if (!_cache.TryGetValue("PhoneNumber", out phoneNumber phoneNum))
			{
				// ���� ���� � ����, �������� � ���� ����� ����� �����
				phoneNum = await _escortService.GetPhoneAsync();

                // ������ �� 10 ������
                _cache.Set("PhoneNumber", phoneNum, TimeSpan.FromMinutes(10));
            }

            // ��������� ����������� (��� �����) ���������
            return phoneNum;
        }

        // ����� ��� ������������ ��������� ����� ViewBag
        private async Task SetCommonViewDataAsync(string pageLoc)
        {
            var phoneNum = await GetCachedPhoneAsync(); // ������������� ��������� ���������� �����
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
			var rnd = new Random();
			var chunk = escorts
				.Skip(skip)
				.Take(take)
				.Select(e => new EscortWithPhoto
				{
					Escort = e,
					PhotoUrl = _photoHelper.GetProfilePhoto(e.Name, e.Id),
					Badges = GenerateRandomBadges(rnd)
				})
				.ToList();

			return PartialView("_EscortCardsPartial", chunk);
		}
		private List<string> GenerateRandomBadges(Random rnd)
		{
			var badgeCount = rnd.Next(0, 4);
			var badges = new List<string>();
			if (badgeCount >= 1) badges.Add("Available now");
			if (badgeCount >= 2) badges.Add("Online");
			if (badgeCount == 3) badges.Add("Verified");
			return badges;
		}




		[HttpGet]
		public async Task<IActionResult> ByLocation(string state, string city)
		{
			var escorts = await _escortService.GetEscortsByLocationAsync(state, city);

			var escortsWithPhoto = new List<EscortWithPhoto>();

			foreach (var e in escorts)
			{
				escortsWithPhoto.Add(new EscortWithPhoto
				{
					Escort = e,
					PhotoUrl = _photoHelper.GetProfilePhoto(e.Name, e.Id),

				});
			}
			var model = new EscortsViewModel { };
			if (city == "las-vegas")
			{
				model = new EscortsViewModel
				{
					Featured = escortsWithPhoto.Take(4).ToList(),
					Regular = escortsWithPhoto.Skip(4).ToList()
				};
			}
			else
			{
				model = new EscortsViewModel
				{
					Featured = escortsWithPhoto.ToList()
				};
			}


			if (!escorts.Any())
			{
				return NotFound("No escorts found for this location.");
			}

			ViewBag.State = state.Replace("-", " ");
			ViewBag.City = city.Replace("-", " ");
			return View("ByLocation", model);
		}
















		public async Task<IActionResult> index()
		{
			var escorts = await _escortService.GetEscortsAsync();

			var rnd = new Random();
			var escortsWithPhoto = new List<EscortWithPhoto>();

			foreach (var e in escorts)
			{
				var cacheKey = $"Badges_{e.Id}";

				if (!_cache.TryGetValue(cacheKey, out List<string> badges))
				{
					badges = GenerateRandomBadges(rnd);
					_cache.Set(cacheKey, badges, TimeSpan.FromMinutes(15));
				}

				escortsWithPhoto.Add(new EscortWithPhoto
				{
					Escort = e,
					PhotoUrl = _photoHelper.GetProfilePhoto(e.Name, e.Id),
					Badges = badges
				});
			}

			var model = new EscortsViewModel
			{
				Featured = escortsWithPhoto.Take(4).ToList(),
				Regular = escortsWithPhoto.Skip(4).ToList()
			};

			return View(model);
		}
		public IActionResult about_us()
		{
			var breadcrumbs = new List<BreadcrumbItem>
	{
		new BreadcrumbItem { Title = "Home", Controller = "Home", Action = "Index", IsActive = false },
		new BreadcrumbItem { Title = "About Us", IsActive = true }
	};

			ViewBag.Breadcrumbs = breadcrumbs;
			return View();
		}
		public IActionResult terminology()
		{
			var breadcrumbs = new List<BreadcrumbItem>
	{
		new BreadcrumbItem { Title = "Home", Controller = "Home", Action = "Index", IsActive = false },
		new BreadcrumbItem { Title = "Terminology", IsActive = true }
	};

			ViewBag.Breadcrumbs = breadcrumbs;
			return View();
		}
		public IActionResult etiquette()
		{
			var breadcrumbs = new List<BreadcrumbItem>
	{
		new BreadcrumbItem { Title = "Home", Controller = "Home", Action = "Index", IsActive = false },
		new BreadcrumbItem { Title = "Etiquette", IsActive = true }
	};

			ViewBag.Breadcrumbs = breadcrumbs;
			return View();
		}
		public IActionResult category_page()
		{
			var breadcrumbs = new List<BreadcrumbItem>
	{
		new BreadcrumbItem { Title = "Home", Controller = "Home", Action = "Index", IsActive = false },
		new BreadcrumbItem { Title = "Category Page", IsActive = true }
	};

			ViewBag.Breadcrumbs = breadcrumbs;
			return View();
		}
		public IActionResult common_page()
		{
			var breadcrumbs = new List<BreadcrumbItem>
	{
		new BreadcrumbItem { Title = "Home", Controller = "Home", Action = "Index", IsActive = false },
		new BreadcrumbItem { Title = "Common Page", IsActive = true }
	};

			ViewBag.Breadcrumbs = breadcrumbs;
			return View();
		}
		public IActionResult contact_us()
		{
			var breadcrumbs = new List<BreadcrumbItem>
	{
		new BreadcrumbItem { Title = "Home", Controller = "Home", Action = "Index", IsActive = false },
		new BreadcrumbItem { Title = "Contact Us", IsActive = true }
	};

			ViewBag.Breadcrumbs = breadcrumbs;
			return View();
		}
		public IActionResult create_account()
		{
			var breadcrumbs = new List<BreadcrumbItem>
	{
		new BreadcrumbItem { Title = "Home", Controller = "Home", Action = "Index", IsActive = false },
		new BreadcrumbItem { Title = "Create Account", IsActive = true }
	};

			ViewBag.Breadcrumbs = breadcrumbs;
			return View();
		}
		public async Task<IActionResult> model_profile(int id)
		{
			var escort = await _escortService.GetEscortByIdAsync(id);
			if (escort == null) return NotFound();

            var photoCount = _photoHelper.GetPhotoCount(escort.Name, escort.Id);

            var model = new EscortProfileViewModel
            {
                Escort = escort,
                PhotoCount = photoCount,
                Services = await _escortService.GetServicesByEscortIdAsync(id),
                RandomEscorts = (await _escortService.GetRandomEscortsAsync(6))
                    .Select(e => new EscortWithPhoto
                    {
                        Escort = e,
                        PhotoUrl = _photoHelper.GetProfilePhoto(e.Name, e.Id)
                    }).ToList()
            };


            var services = await _escortService.GetServicesByEscortIdAsync(id);
            var random = (await _escortService.GetRandomEscortsAsync(6))
                .Select(e => new EscortWithPhoto
                {
                    Escort = e,
                    PhotoUrl = _photoHelper.GetProfilePhoto(e.Name, e.Id)
                }).ToList();

			var breadcrumbs = new List<BreadcrumbItem>
	{
		new BreadcrumbItem { Title = "Home", Controller = "Home", Action = "Index", IsActive = false },
		new BreadcrumbItem { Title = model.Escort.Name, IsActive = true }
	};

			ViewBag.Breadcrumbs = breadcrumbs;
			return View(model);
		}

            ViewBag.Breadcrumbs = breadcrumbs;
            return View(model);
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
