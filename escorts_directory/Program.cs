using escorts_directory.Context;
using escorts_directory.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString));

builder.Services.AddMemoryCache();
builder.Services.AddScoped<IEscortService, EscortService>();
builder.Services.AddScoped<PhotoHelper>();
builder.Services.AddSingleton<LocationDataService>();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseStaticFiles();


// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
	app.UseExceptionHandler("/Error/500");
	app.UseStatusCodePagesWithReExecute("/Error/{0}");
	//app.UseExceptionHandler("/Home/Error");
	// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
	app.UseHsts();
}

// Ось тут важливе доповнення
app.Use(async (context, next) =>
{
	await next();

	if (context.Response.StatusCode == 404 && !context.Response.HasStarted)
	{
		context.Request.Path = "/Error/404";
		await next();
	}
});


app.UseRouting();

app.UseAuthorization();

//app.MapControllerRoute(
//    name: "default",
//    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapControllerRoute(
	name: "escort-profile",
	pattern: "{state}/{city}/{name}",
	defaults: new { controller = "Home", action = "ModelProfile" });

//app.MapControllerRoute(
//	name: "escort-location",
//	pattern: "{state}/{city}",
//	defaults: new { controller = "Home", action = "ByLocation" });

app.MapControllerRoute(
	name: "page",
	pattern: "{page}",
	defaults: new { controller = "Home", action = "StaticPage" });

app.MapControllerRoute(
	name: "default",
	pattern: "{controller=Home}/{action=Index}/{id?}");


app.Run();
