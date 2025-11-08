import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Plane } from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Plane className="h-8 w-8 text-cyan-400" />
              <h3 className="text-2xl font-bold">EasyGo Travels</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Your gateway to unforgettable adventures. We specialize in creating personalized travel experiences that turn your dreams into reality.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-cyan-500 rounded-full flex items-center justify-center transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-cyan-500 rounded-full flex items-center justify-center transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-cyan-500 rounded-full flex items-center justify-center transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 hover:bg-cyan-500 rounded-full flex items-center justify-center transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#destinations" className="hover:text-cyan-400 transition-colors">Destinations</a></li>
              <li><a href="#services" className="hover:text-cyan-400 transition-colors">Services</a></li>
              <li><a href="#packages" className="hover:text-cyan-400 transition-colors">Packages</a></li>
              <li><a href="#testimonials" className="hover:text-cyan-400 transition-colors">Testimonials</a></li>
              <li><a href="#contact" className="hover:text-cyan-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Cancellation Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} EasyGo Travel Agency. All rights reserved.</p>
          <p className="mt-2 text-sm">Made with passion for travelers worldwide</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;