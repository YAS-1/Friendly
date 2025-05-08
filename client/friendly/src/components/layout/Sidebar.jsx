import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaUser, FaUsers, FaBookmark, FaCog } from "react-icons/fa";
import { selectCurrentUser } from "../../store/slices/authSlice";

const Sidebar = () => {
	const user = useSelector(selectCurrentUser);

	const navigationItems = [
		{
			icon: <FaUser className='w-5 h-5' />,
			label: "Profile",
			path: `/profile/${user?._id}`,
		},
		{
			icon: <FaUsers className='w-5 h-5' />,
			label: "Friends",
			path: "/friends",
		},
		{
			icon: <FaBookmark className='w-5 h-5' />,
			label: "Saved Posts",
			path: "/saved",
		},
		{
			icon: <FaCog className='w-5 h-5' />,
			label: "Settings",
			path: "/settings",
		},
	];

	return (
		<aside className='hidden md:flex md:w-64 lg:w-72 flex-col fixed left-0 top-16 bottom-0 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto'>
			{/* User Profile Summary */}
			<div className='flex flex-col items-center mb-8 pt-4'>
				<div className='w-24 h-24 rounded-full overflow-hidden mb-4'>
					{user?.profilePhoto ? (
						<img
							src={user.profilePhoto}
							alt={user.username}
							className='w-full h-full object-cover'
						/>
					) : (
						<div className='w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center'>
							<FaUser className='w-12 h-12 text-gray-400 dark:text-gray-500' />
						</div>
					)}
				</div>
				<h2 className='text-xl font-semibold text-gray-800 dark:text-gray-100'>
					{user?.username}
				</h2>
				<p className='text-sm text-gray-500 dark:text-gray-400 text-center mt-2'>
					{user?.bio || "No bio yet"}
				</p>

				{/* User Stats */}
				<div className='flex justify-around w-full mt-6 pb-6 border-b border-gray-200 dark:border-gray-700'>
					<div className='text-center'>
						<span className='block font-semibold text-gray-800 dark:text-gray-200'>
							Posts
						</span>
						<span className='text-gray-600 dark:text-gray-400'>0</span>
					</div>
					<div className='text-center'>
						<span className='block font-semibold text-gray-800 dark:text-gray-200'>
							Followers
						</span>
						<span className='text-gray-600 dark:text-gray-400'>0</span>
					</div>
					<div className='text-center'>
						<span className='block font-semibold text-gray-800 dark:text-gray-200'>
							Following
						</span>
						<span className='text-gray-600 dark:text-gray-400'>0</span>
					</div>
				</div>
			</div>

			{/* Navigation Links */}
			<nav className='flex-1'>
				<ul className='space-y-2'>
					{navigationItems.map((item) => (
						<li key={item.path}>
							<Link
								to={item.path}
								className='flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200'>
								{item.icon}
								<span>{item.label}</span>
							</Link>
						</li>
					))}
				</ul>
			</nav>

			{/* Footer */}
			<div className='mt-auto pt-6 border-t border-gray-200 dark:border-gray-700'>
				<div className='text-xs text-gray-500 dark:text-gray-400 space-y-1'>
					<p>© 2024 Friendly</p>
					<div className='flex space-x-2'>
						<Link
							to='/privacy'
							className='hover:text-gray-700 dark:hover:text-gray-300'>
							Privacy
						</Link>
						<span>·</span>
						<Link
							to='/terms'
							className='hover:text-gray-700 dark:hover:text-gray-300'>
							Terms
						</Link>
						<span>·</span>
						<Link
							to='/help'
							className='hover:text-gray-700 dark:hover:text-gray-300'>
							Help
						</Link>
					</div>
				</div>
			</div>
		</aside>
	);
};

export default Sidebar;
