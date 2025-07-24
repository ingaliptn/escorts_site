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

        [Route("Home/LoadMoreEscorts")]
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

        [Route("{state}/{city}")]
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
                return RedirectToAction("Error404", "Error");
            }
			var breadcrumbs = new List<BreadcrumbItem>
			{
				new BreadcrumbItem { Title = "Home", Controller = "Home", Action = "Index", IsActive = false },
				new BreadcrumbItem { Title = city, Controller = "Home", Action = "ByLocation", IsActive = true }
			};

			ViewBag.Breadcrumbs = breadcrumbs;

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

        public async Task<IActionResult> StaticPage(string page)
        {
            page = page?.ToLowerInvariant();

            var breadcrumbs = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "Home", Controller = "Home", Action = "Index", IsActive = false }
            };

            string viewName = null;

            switch (page)
            {
                case "about_us":
                    breadcrumbs.Add(new BreadcrumbItem { Title = "About Us", IsActive = true });
                    viewName = "about_us";
                    break;

                case "terminology":
                    breadcrumbs.Add(new BreadcrumbItem { Title = "Terminology", IsActive = true });
                    viewName = "Terminology";
                    break;

                case "create_account":
                    breadcrumbs.Add(new BreadcrumbItem { Title = "Create Account", IsActive = true });
                    viewName = "CreateAccount";
                    break;

                case "contact_us":
                    breadcrumbs.Add(new BreadcrumbItem { Title = "Contact Us", IsActive = true });
                    viewName = "Contact_Us";
                    break;

                case "etiquette":
                    breadcrumbs.Add(new BreadcrumbItem { Title = "Etiquette", IsActive = true });
                    viewName = "Etiquette";
                    break;

                case "category_page":
                    breadcrumbs.Add(new BreadcrumbItem { Title = "Categories", IsActive = true });
                    viewName = "Category Page";
                    break;

                case "common_page":
                    breadcrumbs.Add(new BreadcrumbItem { Title = "Information", IsActive = true });
                    viewName = "Common_Page";
                    break;

                default:
                    return NotFound();
            }

            ViewBag.Breadcrumbs = breadcrumbs;

            // Якщо хочеш підтягувати контент з БД — використовуй цей метод
            //var pageInfo = await _escortService.GetInfoAsync(page);
            //ViewBag.PageInfo = pageInfo;

            return View(viewName);
        }

        public async Task<IActionResult> ModelProfile(string city, string name)
        {
            var escort = await _escortService.GetEscortBySlugAsync(city, name);
            if (escort == null) return NotFound();

            var photoCount = _photoHelper.GetPhotoCount(escort.Name, escort.Id);
            var services = await _escortService.GetServicesByEscortIdAsync(escort.Id);
            var random = (await _escortService.GetEscortsByCityAsync(city))
                .Select(e => new EscortWithPhoto
                {
                    Escort = e,
                    PhotoUrl = _photoHelper.GetProfilePhoto(e.Name, e.Id)
                }).ToList();

            var model = new EscortProfileViewModel
            {
                Escort = escort,
                PhotoCount = photoCount,
                Services = services,
                RandomEscorts = random
            };

            var breadcrumbs = new List<BreadcrumbItem>
            {
                new BreadcrumbItem { Title = "Home", Controller = "Home", Action = "Index", IsActive = false },
                new BreadcrumbItem { Title = escort.LocationCity, Controller = "Home", Action = "ByLocation", RouteValues = new Dictionary<string, string>
                {
                    { "state", escort.LocationState.ToLower().Replace(" ", "-")
                        },
                    { "city", escort.LocationCity.ToLower().Replace(" ", "-") }
                }, IsActive = false },
                new BreadcrumbItem { Title = escort.Name, IsActive = true }
            };

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
