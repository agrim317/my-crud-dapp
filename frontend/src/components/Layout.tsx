import { Link, Outlet } from 'react-router-dom';
import ConnectButton from './ConnectButton';

export function Layout() {
  return (
    <div>
      {/* Header with dApp title and Connect button */}
      <header className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-900 text-gray-100">
        <h1 className="text-3xl font-bold">CRUD dApp</h1>
        <ConnectButton />
      </header>

      {/* Navigation Bar */}
      <nav className="flex justify-start items-center p-4 border-b border-gray-700 bg-gray-800 space-x-6 overflow-x-auto">
        <Link 
          to="/" 
          className="text-gray-300 hover:text-blue-400 font-medium transition-colors duration-200 whitespace-nowrap"
        >
          Home
        </Link>
        <Link 
          to="/secure-crud" 
          className="text-gray-300 hover:text-blue-400 font-medium transition-colors duration-200 whitespace-nowrap"
        >
          Secure CRUD
        </Link>
        <Link 
          to="/sc04-lack-of-input-validation" 
          className="text-gray-300 hover:text-blue-400 font-medium transition-colors duration-200 whitespace-nowrap"
        >
          Lack of Input Validation
        </Link>
        <Link 
          to="/sc08-integer-overflow-and-underflow" 
          className="text-gray-300 hover:text-blue-400 font-medium transition-colors duration-200 whitespace-nowrap"
        >
          Integer Overflow and Underflow
        </Link>
      </nav>

      {/* Main Content Area */}
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}