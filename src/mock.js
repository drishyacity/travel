// Mock data for the travel agency website

export const destinations = [
  {
    id: 1,
    name: "Maldives Paradise",
    description: "Crystal clear waters and pristine white beaches await you in this tropical paradise.",
    image: "https://images.unsplash.com/photo-1603477849227-705c424d1d80?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNofGVufDB8fHx8MTc2MjQ0NzMzOXww&ixlib=rb-4.1.0&q=85",
    price: "$2,999",
    duration: "7 Days / 6 Nights",
    rating: 4.9
  },
  {
    id: 2,
    name: "Bali Adventure",
    description: "Experience the magic of Bali with stunning beaches, ancient temples, and vibrant culture.",
    image: "https://images.unsplash.com/photo-1535262412227-85541e910204?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHx0cm9waWNhbCUyMGJlYWNofGVufDB8fHx8MTc2MjQ0NzMzOXww&ixlib=rb-4.1.0&q=85",
    price: "$2,499",
    duration: "8 Days / 7 Nights",
    rating: 4.8
  },
  {
    id: 3,
    name: "Caribbean Dreams",
    description: "Relax on golden beaches and explore the vibrant underwater world of the Caribbean.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwzfHx0cm9waWNhbCUyMGJlYWNofGVufDB8fHx8MTc2MjQ0NzMzOXww&ixlib=rb-4.1.0&q=85",
    price: "$3,299",
    duration: "5 Days / 4 Nights",
    rating: 4.7
  },
  {
    id: 4,
    name: "Seychelles Escape",
    description: "Discover the hidden gems of Seychelles with its unique granite formations and turquoise waters.",
    image: "https://images.unsplash.com/photo-1586500036065-bdaeac7a4feb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHw0fHx0cm9waWNhbCUyMGJlYWNofGVufDB8fHx8MTc2MjQ0NzMzOXww&ixlib=rb-4.1.0&q=85",
    price: "$3,799",
    duration: "10 Days / 9 Nights",
    rating: 5.0
  },
  {
    id: 5,
    name: "Fiji Islands",
    description: "Immerse yourself in the warm hospitality and breathtaking beauty of Fiji's islands.",
    image: "https://images.pexels.com/photos/240526/pexels-photo-240526.jpeg",
    price: "$2,899",
    duration: "6 Days / 5 Nights",
    rating: 4.8
  },
  {
    id: 6,
    name: "Tahiti Paradise",
    description: "Experience French Polynesia's most romantic destination with overwater bungalows.",
    image: "https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg",
    price: "$4,299",
    duration: "9 Days / 8 Nights",
    rating: 4.9
  }
];

export const services = [
  {
    id: 1,
    icon: "✈️",
    title: "Flight Booking",
    description: "Find the best deals on flights worldwide with our exclusive partnerships."
  },
  {
    id: 2,
    icon: "🏨",
    title: "Hotel Reservations",
    description: "Luxurious accommodations handpicked for your comfort and convenience."
  },
  {
    id: 3,
    icon: "🗺️",
    title: "Custom Itineraries",
    description: "Personalized travel plans tailored to your preferences and budget."
  },
  {
    id: 4,
    icon: "🎒",
    title: "Adventure Tours",
    description: "Exciting activities and guided tours for the adventurous traveler."
  },
  {
    id: 5,
    icon: "📸",
    title: "Photography Tours",
    description: "Capture stunning moments with our professional photography experiences."
  },
  {
    id: 6,
    icon: "🍽️",
    title: "Culinary Experiences",
    description: "Savor authentic local cuisines with our exclusive food tours."
  }
];

export const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "New York, USA",
    image: "https://i.pravatar.cc/150?img=1",
    rating: 5,
    comment: "The Maldives trip was absolutely breathtaking! Every detail was perfectly planned. Highly recommend!"
  },
  {
    id: 2,
    name: "Michael Chen",
    location: "Toronto, Canada",
    image: "https://i.pravatar.cc/150?img=12",
    rating: 5,
    comment: "Best travel experience ever! The team made sure everything was seamless from start to finish."
  },
  {
    id: 3,
    name: "Emma Williams",
    location: "London, UK",
    image: "https://i.pravatar.cc/150?img=5",
    rating: 5,
    comment: "Incredible service and amazing destinations. Can't wait to book my next adventure!"
  }
];

export const packages = [
  {
    id: 1,
    name: "Honeymoon Special",
    duration: "7-10 Days",
    price: "From $3,499",
    features: [
      "Romantic beachfront accommodation",
      "Couples spa treatments",
      "Private candlelit dinners",
      "Sunset cruise experience"
    ]
  },
  {
    id: 2,
    name: "Family Adventure",
    duration: "8-12 Days",
    price: "From $4,999",
    features: [
      "Family-friendly resorts",
      "Kids activities and entertainment",
      "Water sports and excursions",
      "All-inclusive meal plans"
    ]
  },
  {
    id: 3,
    name: "Solo Explorer",
    duration: "5-7 Days",
    price: "From $2,299",
    features: [
      "Boutique hotel stays",
      "Group tours and activities",
      "Local cultural experiences",
      "24/7 travel support"
    ]
  }
];

// Simulated booking submission
export const submitBooking = async (bookingData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const booking = {
        ...bookingData,
        id: Math.random().toString(36).substr(2, 9),
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      // Store in localStorage
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      bookings.push(booking);
      localStorage.setItem('bookings', JSON.stringify(bookings));
      
      resolve(booking);
    }, 1000);
  });
};

// Get all bookings
export const getBookings = () => {
  return JSON.parse(localStorage.getItem('bookings') || '[]');
};