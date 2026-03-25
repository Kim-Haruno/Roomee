import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { APP_NAME } from '@/config/appConfig';

export const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <img src="/logo.png" alt={APP_NAME} className="h-8 w-8 object-contain" />
                <span className="font-bold text-xl">{APP_NAME}</span>
              </Link>
            <p className="text-sm text-muted-foreground">
              Your trusted platform for student accommodation and roommate matching.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/listings" className="hover:text-foreground transition-colors">
                  Find Housing
                </Link>
              </li>
              <li>
                <Link to="/roommates" className="hover:text-foreground transition-colors">
                  Find Roommates
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-foreground transition-colors">
                  List Your Property
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/help" className="hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-foreground transition-colors">
                  Safety Tips
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                mcneal0745516650@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +27659016426
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                40 Hornbill Str, Burgersfort, Limpopo
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
