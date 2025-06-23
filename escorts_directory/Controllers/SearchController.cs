using escorts_directory.Models;
using escorts_directory.Models.VM;
using escorts_directory.Services;
using Microsoft.AspNetCore.Mvc;

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

	[HttpGet]
	public async Task<IActionResult> Index([FromQuery] SearchFilterViewModel model)
	{
		Console.WriteLine($"State: {model.SelectedState}, City: {model.SelectedCity}, Gender: {model.SelectedGender}");

		var allEscorts = await _escortService.GetEscortsAsync();

		model.SelectedState = string.IsNullOrWhiteSpace(model.SelectedState) || model.SelectedState == "0" ? null : model.SelectedState;
		model.SelectedCity = string.IsNullOrWhiteSpace(model.SelectedCity) || model.SelectedCity == "0" ? null : model.SelectedCity;
		model.SelectedGender = string.IsNullOrWhiteSpace(model.SelectedGender) || model.SelectedGender == "0" ? null : model.SelectedGender;

		var filtered = allEscorts.Where(e =>
	(model.SelectedState == null || string.Equals(e.LocationState, model.SelectedState, StringComparison.OrdinalIgnoreCase)) &&
	(model.SelectedCity == null || string.Equals(e.LocationCity, model.SelectedCity, StringComparison.OrdinalIgnoreCase)) &&
	(model.SelectedGender == null || string.Equals(e.Gender, model.SelectedGender, StringComparison.OrdinalIgnoreCase))
).ToList();



		model.Results = filtered.Select(e => new EscortWithPhoto
		{
			Escort = e,
			PhotoUrl = _photoHelper.GetProfilePhoto(e.Name, e.Id)
		}).ToList();

		// Ініціалізація списків для форми
		model.States = _locationService.GetStates();
		model.Genders = _locationService.GetGenders();
		model.Cities = _locationService.GetCitiesForState(model.SelectedState ?? "");

		return View("~/Views/Home/category_page.cshtml", model); // Показ результатів у category_page
	}


	[HttpGet]
	public JsonResult GetCities(string state)
	{
		var cities = _locationService.GetCitiesForState(state);
		return Json(cities);
	}

}
