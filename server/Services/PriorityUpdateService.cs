using Microsoft.EntityFrameworkCore;
using AmusementParkAPI.Data;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace AmusementParkAPI.Services
{
    public class PriorityUpdateService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<PriorityUpdateService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromHours(1); // Check every hour

        public PriorityUpdateService(
            IServiceProvider serviceProvider,
            ILogger<PriorityUpdateService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await UpdateMaintenanceRequestPriorities();
                    await Task.Delay(_checkInterval, stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error updating maintenance request priorities");
                    // Wait a bit before retrying on error
                    await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
                }
            }
        }

        private async Task UpdateMaintenanceRequestPriorities()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                
                var now = DateTime.Now;
                var twentyFourHoursAgo = now.AddHours(-24);
                var fortyEightHoursAgo = now.AddHours(-48);

                // Get all "In Progress" maintenance requests
                var inProgressRequests = await context.MaintenanceRequests
                    .Where(m => m.Status == "In Progress" && m.RequestDate != null)
                    .ToListAsync();

                int updatedCount = 0;

                foreach (var request in inProgressRequests)
                {
                    if (request.RequestDate == null) continue;

                    var timeSinceRequest = now - request.RequestDate.Value;
                    int? newAlertId = null;
                    bool shouldUpdate = false;

                    // Update priority based on elapsed time from Request_Date
                    // Only upgrade priorities, don't downgrade or set initial values (that's done during assignment)
                    if (timeSinceRequest.TotalHours >= 48)
                    {
                        // Over 48 hours - should be Alert_ID 3 (High priority)
                        // Only upgrade if current priority is less than 3
                        if (request.AlertId == null || request.AlertId.Value < 3)
                        {
                            newAlertId = 3;
                            shouldUpdate = true;
                        }
                    }
                    else if (timeSinceRequest.TotalHours >= 24)
                    {
                        // Over 24 hours - should be Alert_ID 2 (Medium priority)
                        // Only upgrade if current priority is 1 (don't downgrade from 3, and skip if already 2)
                        if (request.AlertId == 1)
                        {
                            newAlertId = 2;
                            shouldUpdate = true;
                        }
                    }
                    // Less than 24 hours: don't change priority in background service
                    // Initial assignment to 1 is handled in the assignment endpoint

                    // Update only if needed
                    if (shouldUpdate && newAlertId.HasValue)
                    {
                        request.AlertId = newAlertId.Value;
                        updatedCount++;
                    }
                }

                if (updatedCount > 0)
                {
                    await context.SaveChangesAsync();
                    _logger.LogInformation($"Updated {updatedCount} maintenance request priorities");
                }
            }
        }
    }
}

