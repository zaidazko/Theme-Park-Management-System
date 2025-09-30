using Microsoft.EntityFrameworkCore;
using server.Data;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var cs = builder.Configuration.GetConnectionString("Default");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(cs, ServerVersion.AutoDetect(cs)));


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Middleware here if needed

// Map Endpoints here
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapGet("/test", async (AppDbContext db) =>
{
    var tables = await db.Database.GetDbConnection().GetSchemaAsync("Tables");
    return new { connected = true, tableCount = tables.Rows.Count };
});

app.Run();

