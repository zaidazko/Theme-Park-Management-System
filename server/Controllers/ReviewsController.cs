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

        // POST: api/reviews
        [HttpPost]
        public async Task<ActionResult> CreateReview([FromBody] CreateReview review)
        {
            var newReview = new Reviews
            {
                Customer_ID = review.Customer_ID,
                Ride_ID = review.Ride_ID,
                Score = review.Rating,
                Feedback = review.Feedback,
                Date = DateTime.Now
            };

            _context.Reviews.Add(newReview);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Review created successfully",
                reviewId = newReview.Review_ID
            });
        }

        // GET: api/reviews/ride
        [HttpGet("ride")]
        public async Task<ActionResult<IEnumerable<object>>> GetReviewsByRide(int rideId)
        {
            var reviews = await _context.Reviews
                .Join(_context.Rides,
                    review => review.Ride_ID,
                    ride => ride.Ride_ID,
                    (review, ride) => new { review, ride })
                .Join(_context.Customers,
                    rr => rr.review.Customer_ID,
                    customer => customer.CustomerId,
                    (rr, customer) => new
                    {
                        reviewID = rr.review.Review_ID,
                        rideID = rr.ride.Ride_ID,
                        rideName = rr.ride.Ride_Name,
                        customerID = customer.CustomerId,
                        customerName = customer.FirstName + " " + customer.LastName,
                        score = rr.review.Score,
                        feedback = rr.review.Feedback,
                        reviewDate = rr.review.Date
                    })
                .OrderByDescending(r => r.reviewDate)
                .ToListAsync();

            return Ok(reviews);
        }

        // GET: api/reviews/customer/{customerId}
        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetCustomerReviews(int customerId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.Customer_ID == customerId)
                .Join(_context.Rides,
                    review => review.Ride_ID,
                    ride => ride.Ride_ID,
                    (review, ride) => new
                    {
                        rideName = ride.Ride_Name,
                        reviewDate = review.Date,
                        score = review.Score,
                        feedback = review.Feedback
                    }

                )
                .ToListAsync();

            return Ok(reviews);
        }
    }
}