using escorts_directory.Models;
using escorts_directory.Models.VM;
using escorts_directory.Services;
using Microsoft.AspNetCore.Mvc;

[Route("Search")]
public class SearchController : Controller
{
    private readonly IEscortService _escortService;
    private readonly LocationDataService _locationService;
    private readonly PhotoHelper _photoHelper;

    public SearchController(IEscortService escortService, LocationDataService locationService, PhotoHelper photoHelper)
    {
        _escortService = escortService;
        _locationService = locationService;
        _photoHelper = photoHelper;
    }

    [HttpGet("")]
    public async Task<IActionResult> Index([FromQuery] SearchFilterViewModel model)
    {
        // Очищення нулів і дефолтних значень
        model.SelectedState = string.IsNullOrWhiteSpace(model.SelectedState) || model.SelectedState == "0" ? null : model.SelectedState;
        model.SelectedCity = string.IsNullOrWhiteSpace(model.SelectedCity) || model.SelectedCity == "0" ? null : model.SelectedCity;

        if (model.SelectedState != null && model.SelectedCity != null)
        {
            // Генеруємо slug'и (якщо потрібно – заміни пробіли на дефіси)
            var stateSlug = model.SelectedState.ToLower().Replace(" ", "-");
            var citySlug = model.SelectedCity.ToLower().Replace(" ", "-");

            // редірект на /state/city
            return RedirectToAction("ByLocation", "Home", new { state = stateSlug, city = citySlug });
        }

        // Якщо дані не валідні або не обрано, повертаємось на сторінку пошуку
        model.States = _locationService.GetStates();
        model.Cities = _locationService.GetCitiesForState(model.SelectedState ?? "");

        // TODO: можеш створити окремий view, якщо хочеш відображати часткові результати
        return View("SearchForm", model); // або поверни просто Index
    }

    [Route("GetCities")]
    [HttpGet]
    public JsonResult GetCities(string state)
    {
        var cities = _locationService.GetCitiesForState(state);
        return Json(cities);
    }
}
