import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { services, packages } from '../mock';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Check, Plane, Hotel, Map, Backpack, Camera, UtensilsCrossed } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const iconMap = {
  'Flight Booking': Plane,
  'Hotel Reservations': Hotel,
  'Custom Itineraries': Map,
  'Adventure Tours': Backpack,
  'Photography Tours': Camera,
  'Culinary Experiences': UtensilsCrossed
};

function ServiceCard({ service, index }) {
  const cardRef = useRef();
  const IconComponent = iconMap[service.title] || Plane;

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      {
        opacity: 0,
        y: 50,
        scale: 0.9
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        delay: index * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 85%'
        }
      }
    );
  }, [index]);

  return (
    <Card
      ref={cardRef}
      className="text-center p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-0 shadow-lg"
    >
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
        <IconComponent className="h-8 w-8 text-white" />
      </div>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-800">{service.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{service.description}</p>
      </CardContent>
    </Card>
  );
}

function PackageCard({ pkg, index }) {
  const cardRef = useRef();

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      {
        opacity: 0,
        rotateX: -15,
        y: 50
      },
      {
        opacity: 1,
        rotateX: 0,
        y: 0,
        duration: 1,
        delay: index * 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 85%'
        }
      }
    );
  }, [index]);

  return (
    <Card
      ref={cardRef}
      className="p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-blue-50 border-2 border-blue-100"
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
    >
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-800 mb-2">{pkg.name}</CardTitle>
        <p className="text-gray-600">{pkg.duration}</p>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {pkg.price}
          </p>
          <p className="text-sm text-gray-500">per person</p>
        </div>
        
        <ul className="space-y-3 mb-6">
          {pkg.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-3 transition-transform hover:scale-105">
          Choose Package
        </Button>
      </CardContent>
    </Card>
  );
}

function Services() {
  const servicesRef = useRef();
  const packagesRef = useRef();
  const servicesTitleRef = useRef();
  const packagesTitleRef = useRef();

  useEffect(() => {
    gsap.fromTo(
      servicesTitleRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: servicesRef.current,
          start: 'top 70%'
        }
      }
    );

    gsap.fromTo(
      packagesTitleRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: packagesRef.current,
          start: 'top 70%'
        }
      }
    );
  }, []);

  return (
    <>
      {/* Services Section */}
      <section id="services" ref={servicesRef} className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div ref={servicesTitleRef} className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for a perfect vacation, all in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" ref={packagesRef} className="py-20 px-4 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div ref={packagesTitleRef} className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Travel Packages
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Carefully curated packages designed for every type of traveler
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <PackageCard key={pkg.id} pkg={pkg} index={index} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Services;