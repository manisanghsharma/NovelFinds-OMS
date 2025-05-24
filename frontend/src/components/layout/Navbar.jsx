import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, ShoppingCart, Users, DollarSign, LogOut, Menu, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Inventory', path: '/inventory', icon: <BookOpen size={20} /> },
    { name: 'Orders', path: '/orders', icon: <ShoppingCart size={20} /> },
    { name: 'Customers', path: '/customers', icon: <Users size={20} /> },
    { name: 'Expenses', path: '/expenses', icon: <DollarSign size={20} /> }
  ];

  const handleLogout = () => {
    // Show loading state
    toast.loading('Logging out...', { id: 'logout' });
    
    // Clear auth state first
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    
    // Then navigate and show success
    navigate('/login', { replace: true });
    toast.success('Logged out successfully', { id: 'logout' });
  };
  
  return (
		<nav className='bg-indigo-700 text-white'>
			<div className='container mx-auto px-4'>
				<div className='flex justify-between items-center py-4'>
					<div className='flex items-center space-x-2'>
						<img src={logo} alt="NovelFinds Logo" className='w-11 h-11 rounded-full' />
						<span className='text-xl font-bold hidden sm:inline'>NovelFinds OMS</span>
					</div>

					{/* Desktop Navigation */}
					<div className='hidden md:flex items-center'>
						<div className='flex space-x-6 mr-6'>
							{navItems.map((item) => (
								<Link
									key={item.path}
									to={item.path}
									className={`flex items-center space-x-1 py-2 hover:text-indigo-200 transition-colors cursor-pointer ${
										location.pathname === item.path
											? "border-b-2 border-white font-medium"
											: ""
									}`}
								>
									<span>{item.icon}</span>
									<span>{item.name}</span>
								</Link>
							))}
						</div>

						{/* Desktop Logout Button */}
						<button
							onClick={handleLogout}
							className='flex items-center space-x-1 py-2 px-4 bg-indigo-800 hover:bg-indigo-900 rounded-md transition-colors cursor-pointer'
						>
							<LogOut size={20} />
							<span>Logout</span>
						</button>
					</div>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						className='md:hidden p-2 rounded-md hover:bg-indigo-800 transition-colors'
					>
						{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>
			</div>

			{/* Mobile Navigation */}
			<div className={`md:hidden transition-all duration-300 ease-in-out ${
				isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
			}`}>
				<div className='bg-indigo-800'>
					{navItems.map((item) => (
						<Link
							key={item.path}
							to={item.path}
							onClick={() => setIsMobileMenuOpen(false)}
							className={`flex items-center space-x-3 px-6 py-4 border-b border-indigo-700 transition-colors ${
								location.pathname === item.path
									? "bg-indigo-900 text-white"
									: "text-indigo-200 hover:bg-indigo-900 hover:text-white"
							}`}
						>
							<span>{item.icon}</span>
							<span className='font-medium'>{item.name}</span>
						</Link>
					))}

					{/* Mobile Logout Button */}
					<button
						onClick={() => {
							setIsMobileMenuOpen(false);
							handleLogout();
						}}
						className='flex items-center space-x-3 w-full px-6 py-4 bg-indigo-900 hover:bg-indigo-950 transition-colors cursor-pointer'
					>
						<LogOut size={20} />
						<span className='font-medium'>Logout</span>
					</button>
				</div>
			</div>
		</nav>
	);
};

export default Navbar; 