import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  Briefcase, 
  Settings, 
  User, 
  LogOut,
  Home,
  Building2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface NavigationProps {
  userType?: 'admin' | 'user' | 'company' | null;
  onLogout?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ userType, onLogout }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-hero p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CareerLink LK
            </span>
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActive('/') 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/register"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActive('/courses') 
                  ? 'bg-education text-education-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Courses</span>
            </Link>
            
            <Link
              to="/register"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                isActive('/jobs') 
                  ? 'bg-jobs text-jobs-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Jobs</span>
            </Link>

            {userType === 'admin' && (
              <Link
                to="/admin"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive('/admin') 
                    ? 'bg-admin text-admin-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}

            {userType === 'company' && (
              <Link
                to="/company-dashboard"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  isActive('/company-dashboard') 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {userType ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  {userType === 'user' && (
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};