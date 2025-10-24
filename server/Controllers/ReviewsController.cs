using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AmusementParkAPI.Data;
using AmusementParkAPI.Models;
using AmusementParkAPI.DTOs;

namespace AmusementParkAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReviewsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/reviews
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetReviews()
        {
            return await _context.Reviews.ToListAsync();
        }

        // POST: api/reviews
        [HttpPost]
        public async Task<ActionResult> CreateReview([FromBody] CreateReview review)
        {
            var newReview = new Reviews
            {
                Ride_ID = review.Ride_ID,
                Customer_ID = review.Customer_ID,
                Rating = review.Rating,
                Feedback = review.Feedback,
                Date = review.Date
            };

            _context.Reviews.Add(newReview);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Review created successfully",
                reviewId = newReview.Review_ID
            });
        }

        // GET: api/reviews/ride/{rideId}
        [HttpGet("ride/{rideId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetReviewsByRide(int rideId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.Ride_ID == rideId)
                .Join(_context.Rides,
                    review => review.Ride_ID,
                    ride => ride.Ride_ID,
                    (review, ride) => new {review, ride})
                .Join(_context.Customers,
                    rr => rr.review.Customer_ID,
                    customer => customer.CustomerId,
                    (rr, customer) => new
                    {
                        Review_ID = rr.review.Review_ID,
                        Date = rr.review.Date,
                        Rating = rr.review.Rating,
                        Feedback = rr.review.Feedback,
                        Ride_ID = rr.ride.Ride_ID,
                        Ride_Name = rr.ride.Ride_Name,
                        Customer_ID = customer.CustomerId,
                        Customer_Name = customer.FirstName + " " + customer.LastName
                    })
                .OrderByDescending(r => r.Date)
                .ToListAsync();

            return Ok(reviews);
        }
    }
}