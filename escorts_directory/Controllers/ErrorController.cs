using Microsoft.AspNetCore.Mvc;

namespace escorts_directory.Controllers
{
	public class ErrorController : Controller
	{
		[Route("Error/404")]
		public IActionResult Error404()
		{
			return View("NotFound");
		}

		[Route("Error/500")]
		public IActionResult Error500()
		{
			return View("Error");
		}

		[Route("Error/{code:int}")]
		public IActionResult GenericError(int code)
		{
			Console.WriteLine($"Код помилки: {code}");
			return RedirectToAction("Error404");
		}

	}

}
