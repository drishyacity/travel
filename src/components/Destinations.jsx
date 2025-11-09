import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { destinations } from '../mock';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { MapPin, Clock, Star } from 'lucide-react';
import { toast } from '../hooks/use-toast';

gsap.registerPlugin(ScrollTrigger);

function DestinationCard({ destination, index }) {
  const cardRef = useRef();
  // Build a slug to reference local webp in public folder
  const slug = destination.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const localSrc = `/destinations/${slug}.webp`;
  const [imgSrc, setImgSrc] = useState(localSrc);

  useEffect(() => {
    // 3D transform animation on scroll
    gsap.fromTo(
      cardRef.current,
      {
        opacity: 0,
        rotateY: -45,
        z: -200
      },
      {
        opacity: 1,
        rotateY: 0,
        z: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 80%',
          end: 'top 30%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    // Hover animation
    const card = cardRef.current;
    const handleMouseEnter = () => {
      gsap.to(card, {
        rotateY: 5,
        rotateX: 5,
        z: 20,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        z: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleBookNow = () => {
    toast({
      title: "Booking Initiated",
      description: `Redirecting to booking page for ${destination.name}...`
    });
    
    // Store selected destination
    localStorage.setItem('selectedDestination', JSON.stringify(destination));
    
    // Scroll to contact form
    setTimeout(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  return (
    <div
      ref={cardRef}
      className="destination-card"
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
    >
      <Card className="overflow-hidden h-full shadow-2xl hover:shadow-3xl transition-shadow duration-300 border-0">
        <div className="relative h-64 overflow-hidden">
          <img
            src={imgSrc}
            alt={destination.name}
            loading="lazy"
            onError={() => setImgSrc(destination.image)}
            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-sm">{destination.rating}</span>
          </div>
        </div>
        <CardContent className="p-6">
          <h3 className="text-2xl font-bold mb-2 text-gray-800">{destination.name}</h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{destination.description}</p>
          
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{destination.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>Tropical Paradise</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Starting from</p>
              <p className="text-3xl font-bold text-blue-600">{destination.price}</p>
            </div>
            <Button
              onClick={handleBookNow}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 transition-transform hover:scale-105"
            >
              Book Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Destinations() {
  const sectionRef = useRef();
  const titleRef = useRef();

  useEffect(() => {
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%'
        }
      }
    );
  }, []);

  return (
    <section id="destinations" ref={sectionRef} className="py-20 px-4 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div ref={titleRef} className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Popular Destinations
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked collection of the world's most stunning tropical destinations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination, index) => (
            <DestinationCard key={destination.id} destination={destination} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Destinations;