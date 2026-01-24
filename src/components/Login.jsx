import React from 'react';
import { authenticate, getUserProfile } from '../services/googleSheets';

const ALLOWED_USERS = [
  // Add your authorized email addresses here
  'genaropaez@gmail.com', 'elgenaro@hotmail.com', 'elgenaro@gmail.com',
  // You can add more emails manually
];

const Login = ({ onLoginSuccess }) => {
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Trigger Google Auth Flow
      await authenticate();
      
      // 2. Get User Info (Email)
      const profile = await getUserProfile();
      
      // 3. Verify against Allow List (Manual Accounts)
      // Note: If ALLOWED_USERS is empty, we allow everyone (Demo Mode)
      // Once you add an email, it becomes strict.
      if (ALLOWED_USERS.length > 0 && !ALLOWED_USERS.includes(profile.email)) {
        throw new Error(`Access Denied. The email ${profile.email} is not authorized.`);
      }

      onLoginSuccess(profile);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Recital Planner
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to access your dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              style={{
                backgroundColor: '#4285F4',
                color: 'white',
                marginTop: '10px',
                fontWeight: 'bold',
                width: '100%',
                // Keep inline styles to ensure visibility if Tailwind is missing
              }}
            >
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Secure Access
                </span>
              </div>
            </div>
            <div className="mt-6 text-center text-xs text-gray-400">
              Only authorized accounts can access this application.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
