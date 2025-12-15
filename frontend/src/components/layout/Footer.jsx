import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white text-xl font-bold mb-4">CampusEvents</h3>
            <p className="text-sm mb-4">
              Your gateway to exciting campus events, workshops, and competitions. Connect, learn, and grow with your college community.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/events" className="hover:text-primary transition-colors">Browse Events</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-primary transition-colors">My Dashboard</Link>
              </li>
              <li>
                <Link to="/venues" className="hover:text-primary transition-colors">Venue Booking</Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-primary transition-colors">My Profile</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/events?category=tech" className="hover:text-primary transition-colors">Technical Events</Link>
              </li>
              <li>
                <Link to="/events?category=cultural" className="hover:text-primary transition-colors">Cultural Events</Link>
              </li>
              <li>
                <Link to="/events?category=sports" className="hover:text-primary transition-colors">Sports</Link>
              </li>
              <li>
                <Link to="/events?category=workshop" className="hover:text-primary transition-colors">Workshops</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm">College Campus, City, State 12345</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">+91 1234567890</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">contact@campusevents.edu</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} CampusEvents. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
