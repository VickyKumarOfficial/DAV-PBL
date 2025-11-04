import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, BarChart3, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:inline">
              MindCare Predictor
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <Link to="/">
              <Button
                variant={isActive('/') ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>

            <Link to="/predict">
              <Button
                variant={isActive('/predict') ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Brain className="w-4 h-4" />
                <span className="hidden sm:inline">Predict</span>
              </Button>
            </Link>

            <Link to="/insights">
              <Button
                variant={isActive('/insights') ? 'default' : 'ghost'}
                size="sm"
                className="flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Insights</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 MindCare Predictor - Mental Health Treatment Analysis</p>
        </div>
      </footer>
    </div>
  );
};
