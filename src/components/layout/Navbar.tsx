import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';
import logo from "../../../assets/logo.png";
import { cn } from '../../lib/utils';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
  <img
    src={logo}
    alt="Campus Connect Logo"
    className="h-10 w-10 object-contain"
  />

  <span className="text-xl font-bold text-gray-900">
    Campus Connect
  </span>
</Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            Home
          </Link>
          <Link to="/campus-issues" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
            Campus Issues
          </Link>
          <Link 
            to={user ? (profile?.role === 'CR' ? '/dashboard/cr' : '/dashboard/faculty') : '/login'} 
            className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            Class Issues
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  {profile?.name}
                </span>
                {profile?.role === 'CR' && profile?.section && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-blue-700 shadow-sm">
                    Section {profile.section}
                  </span>
                )}
                {profile?.role === 'Faculty' && profile?.designation && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-blue-700 shadow-sm">
                    {profile.designation}
                  </span>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
