import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { BookOpen, Eye, EyeOff, Lock, User } from 'lucide-react';
import logo from '../assets/logo.png';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (localStorage.getItem('adminToken')) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data } = await axios.post('https://novelfindsomsbackend-production.up.railway.app/api/auth/login', {
                username,
                password,
            });

            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminInfo', JSON.stringify(data));
            toast.success('Login successful');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
			<div className='min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex flex-col relative'>
				{/* Background Pattern */}
				<div className='absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none'></div>

				{/* Header */}
				{/* <header className='bg-indigo-700 text-white py-4 px-4 sm:px-6 lg:px-8 shadow-md z-10'>
                <div className='container mx-auto flex justify-center items-center gap-2'>
                    <BookOpen size={32} className="text-indigo-200" />
                    <h1 className='text-2xl font-bold'>NovelFinds OMS</h1>
                </div>
            </header> */}

				{/* Login Form */}
				<div className='flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10'>
					<div className='w-full max-w-md'>
						<div className='bg-white rounded-xl shadow-xl p-8 border border-indigo-50 transform transition-all duration-300 hover:shadow-2xl'>
							<div className='space-y-6'>
								{/* Logo in card */}
								<div className='flex justify-center'>
										<img
											src={logo}
											alt="NovelFinds Logo"
											className='w-20 h-20 rounded-full'
										/>
								</div>

								<h2 className='text-2xl text-center font-bold text-gray-900 mt-4'>
									Admin Login
								</h2>

								<p className='text-center text-gray-500 text-sm'>
									Enter your credentials to access the admin dashboard
								</p>

								<form onSubmit={handleSubmit} className='space-y-6 mt-8'>
									<div>
										<label
											htmlFor='username'
											className='block text-sm font-medium text-gray-700 mb-1'
										>
											Username
										</label>
										<div className='relative'>
											<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400'>
												<User size={18} />
											</div>
											<input
												id='username'
												name='username'
												type='text'
												required
												value={username}
												onChange={(e) => setUsername(e.target.value)}
												className='appearance-none block w-full pl-10 px-4 py-3 rounded-lg text-gray-900 bg-gray-50 border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200'
												placeholder='Enter your username'
											/>
										</div>
									</div>

									<div>
										<label
											htmlFor='password'
											className='block text-sm font-medium text-gray-700 mb-1'
										>
											Password
										</label>
										<div className='relative'>
											<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400'>
												<Lock size={18} />
											</div>
											<input
												id='password'
												name='password'
												type={showPassword ? "text" : "password"}
												required
												value={password}
												onChange={(e) => setPassword(e.target.value)}
												className='appearance-none block w-full pl-10 px-4 py-3 rounded-lg text-gray-900 bg-gray-50 border border-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 pr-12'
												placeholder='Enter your password'
											/>
											<button
												type='button'
												onClick={() => setShowPassword(!showPassword)}
												className='absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors'
											>
												{showPassword ? (
													<EyeOff size={20} />
												) : (
													<Eye size={20} />
												)}
											</button>
										</div>
									</div>

									<button
										type='submit'
										disabled={loading}
										className='w-full py-3 cursor-pointer px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 text-lg font-medium transform hover:-translate-y-0.5'
									>
										{loading ? (
											<span className='flex items-center justify-center'>
												<svg
													className='animate-spin -ml-1 mr-2 h-5 w-5 text-white'
													xmlns='http://www.w3.org/2000/svg'
													fill='none'
													viewBox='0 0 24 24'
												>
													<circle
														className='opacity-25'
														cx='12'
														cy='12'
														r='10'
														stroke='currentColor'
														strokeWidth='4'
													></circle>
													<path
														className='opacity-75'
														fill='currentColor'
														d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
													></path>
												</svg>
												Signing in...
											</span>
										) : (
											"Sign in"
										)}
									</button>
								</form>
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<footer className='py-3 text-center text-gray-600 text-sm bg-white bg-opacity-70'>
					<p>© {new Date().getFullYear()} NovelFinds. All rights reserved.</p>
				</footer>
			</div>
		);
};

export default AdminLogin; 