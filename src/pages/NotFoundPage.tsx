import { Link } from 'react-router';
import { HelpCircle } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] py-12 text-center">
      <div className="relative mb-8">
        <div className="absolute -top-6 -right-6 text-blue-600 animate-bounce">
          <HelpCircle className="w-12 h-12" />
        </div>
        <h1 className="text-[120px] font-black text-blue-600 leading-none">404</h1>
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-sm">
        Sorry, the page you are looking for doesn't exist or has been moved.
      </p>
      
      <Link
        to="/"
        className="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
      >
        Go Back Home
      </Link>
    </div>
  );
}
