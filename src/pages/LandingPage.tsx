import { Link } from 'react-router';
import { Building, GraduationCap } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] py-12">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl mb-4">
          Welcome to <br />
          <span className="text-blue-600">Campus Connect</span>
        </h1>
        <p className="text-lg text-gray-600">
          Connecting Students with College Administration
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Campus Issues Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center transition-all hover:shadow-md hover:-translate-y-1">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-6 text-blue-600">
            <Building className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Campus Issues</h2>
          <p className="text-gray-500 mb-8 flex-1">
            Share campus reviews and general issues.
          </p>
          <Link
            to="/campus-issues"
            className="w-full max-w-[200px] py-3 px-6 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Open
          </Link>
        </div>

        {/* Class Issues Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center transition-all hover:shadow-md hover:-translate-y-1">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-6 text-blue-600">
            <GraduationCap className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Class Issues</h2>
          <p className="text-gray-500 mb-8 flex-1">
            Report classroom issues through CR.
          </p>
          <Link
            to="/login"
            className="w-full max-w-[200px] py-3 px-6 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Open
          </Link>
        </div>
      </div>
    </div>
  );
}
