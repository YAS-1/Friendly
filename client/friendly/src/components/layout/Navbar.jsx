import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
	FaHome,
	FaEnvelope,
	FaBell,
	FaSearch,
	FaUser,
	FaSignOutAlt,
	FaSun,
	FaMoon,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { selectCurrentUser } from "../../store/slices/authSlice";
import { selectUnreadCount } from "../../store/slices/notificationSlice";
import useAuth from "../../hooks/useAuth";

const Navbar = () => {
	const navigate = useNavigate();
	const { logout } = useAuth();
	const user = useSelector(selectCurrentUser);
	const unreadNotifications = useSelector(selectUnreadCount);
	const { darkMode, toggleTheme } = useTheme();
	const [searchQuery, setSearchQuery] = useState("");

	const handleSearch = (e) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
		}
	};

	return (
		<nav className='bg-surface-light dark:bg-surface-dark shadow-md fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-gray-700'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between h-16'>
					{/* Logo and Brand */}
					<div className='flex items-center'>
						<Link to='/' className='flex-shrink-0 flex items-center'>
							<span className='text-2xl font-bold text-primary-light dark:text-primary-dark'>
								Friendly
							</span>
						</Link>
					</div>

					{/* Search Bar */}
					<div className='flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end'>
						<form
							onSubmit={handleSearch}
							className='max-w-lg w-full lg:max-w-xs'>
							<div className='relative'>
								<input
									type='text'
									placeholder='Search...'
									className='block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-light dark:focus:ring-primary-dark focus:border-primary-light dark:focus:border-primary-dark sm:text-sm'
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<FaSearch className='h-5 w-5 text-gray-400 dark:text-gray-500' />
								</div>
							</div>
						</form>
					</div>

					{/* Navigation Items */}
					<div className='flex items-center'>
						<Link
							to='/'
							className='text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark px-3 py-2 rounded-md text-sm font-medium'>
							<FaHome className='h-6 w-6' />
						</Link>

						<Link
							to='/messages'
							className='text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark px-3 py-2 rounded-md text-sm font-medium'>
							<FaEnvelope className='h-6 w-6' />
						</Link>

						<Link
							to='/notifications'
							className='text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium relative'>
							<FaBell className='h-6 w-6' />
							{unreadNotifications > 0 && (
								<span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
									{unreadNotifications}
								</span>
							)}
						</Link>

						{/* Theme Toggle */}
						<button
							onClick={toggleTheme}
							className='text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark px-3 py-2 rounded-md text-sm font-medium'
							aria-label='Toggle theme'>
							{darkMode ? (
								<FaSun className='h-6 w-6' />
							) : (
								<FaMoon className='h-6 w-6' />
							)}
						</button>

						{/* Profile Dropdown */}
						<div className='ml-3 relative'>
							<div className='flex items-center'>
								<Link
									to={`/profile/${user?._id}`}
									className='text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark px-3 py-2 rounded-md text-sm font-medium'>
									{user?.profilePhoto ? (
										<img
											src={user.profilePhoto}
											alt='Profile'
											className='h-8 w-8 rounded-full object-cover'
										/>
									) : (
										<FaUser className='h-6 w-6' />
									)}
								</Link>
								<button
									onClick={logout}
									className='text-gray-600 dark:text-gray-300 hover:text-primary-light dark:hover:text-primary-dark px-3 py-2 rounded-md text-sm font-medium'>
									<FaSignOutAlt className='h-6 w-6' />
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
