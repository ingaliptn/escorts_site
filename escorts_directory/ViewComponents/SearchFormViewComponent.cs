using Microsoft.AspNetCore.Mvc;
using escorts_directory.Models.VM;
using escorts_directory.Services;

public class SearchFormViewComponent : ViewComponent
{
    private readonly LocationDataService _locationService;

    public SearchFormViewComponent(LocationDataService locationService)
    {
        _locationService = locationService;
    }

    public IViewComponentResult Invoke()
    {
        var model = new SearchFilterViewModel
        {
            States = _locationService.GetStates(),
            Genders = _locationService.GetGenders()
        };

        return View("SearchForm", model);
    }
}
