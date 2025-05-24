import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      <footer className="bg-gray-100 py-4 text-center text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} NovelFinds OMS</p>
      </footer>
    </div>
  );
};

export default Layout; 