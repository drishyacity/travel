import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { testimonials } from '../mock';
import { Card, CardContent } from './ui/card';
import { Star, Quote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

function TestimonialCard({ testimonial, index }) {
  const cardRef = useRef();

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      {
        opacity: 0,
        rotateY: 90,
        x: index % 2 === 0 ? -100 : 100
      },
      {
        opacity: 1,
        rotateY: 0,
        x: 0,
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
      className="p-8 hover:shadow-2xl transition-all duration-300 bg-white border-0 shadow-lg"
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
    >
      <CardContent className="p-0">
        <div className="flex items-center gap-4 mb-4">
          <img
            src={testimonial.image}
            alt={testimonial.name}
            className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-100"
          />
          <div>
            <h4 className="font-bold text-lg text-gray-800">{testimonial.name}</h4>
            <p className="text-sm text-gray-500">{testimonial.location}</p>
          </div>
        </div>
        
        <div className="flex gap-1 mb-4">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        
        <div className="relative">
          <Quote className="absolute -top-2 -left-2 h-8 w-8 text-blue-200" />
          <p className="text-gray-700 italic pl-6">{testimonial.comment}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Testimonials() {
  const sectionRef = useRef();
  const titleRef = useRef();

  useEffect(() => {
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
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
    <section id="testimonials" ref={sectionRef} className="py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div ref={titleRef} className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            What Our Travelers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real experiences from real travelers who've discovered paradise with us
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;