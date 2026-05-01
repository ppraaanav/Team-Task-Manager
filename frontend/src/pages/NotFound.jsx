import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <span className="text-6xl mb-4">🔍</span>
    <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
    <p className="text-gray-500 mb-6">Page not found</p>
    <Link to="/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
      Go to Dashboard
    </Link>
  </div>
);

export default NotFound;
