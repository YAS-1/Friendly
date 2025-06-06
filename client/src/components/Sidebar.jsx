import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
	FiHome,
	FiUser,
	FiMessageSquare,
	FiBell,
	FiBookmark,
	FiSearch,
	FiLogOut,
} from "react-icons/fi";
import ProfilePhoto from "./ProfilePhoto";
import useUnreadCounts from "../hooks/useUnreadCounts";

const Sidebar = () => {
	const { user, logout } = useAuth();
	const { unreadMessages, unreadNotifications } = useUnreadCounts();

	const navItems = [
		{ path: "/", icon: <FiHome size={20} />, label: "Home" },
		{
			path: `/profile/${user?._id}`,
			icon: <FiUser size={20} />,
			label: "Profile",
		},
		{
			path: "/messages",
			icon: <FiMessageSquare size={20} />,
			label: "Messages",
			badge: unreadMessages,
		},
		{
			path: "/notifications",
			icon: <FiBell size={20} />,
			label: "Notifications",
			badge: unreadNotifications,
		},
		{ path: "/bookmarks", icon: <FiBookmark size={20} />, label: "Bookmarks" },
		{ path: "/search", icon: <FiSearch size={20} />, label: "Search" },
	];

	return (
		<div className='fixed h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col'>
			{/* Navigation Links */}
			<nav className='flex-1 overflow-y-auto pr-2'>
				<ul className='space-y-1 mb-1'>
					{navItems.map((item) => (
						<li key={item.path}>
							<NavLink
								to={item.path}
								className={({ isActive }) =>
									`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
										isActive
											? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
											: "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700/30"
									}`
								}>
								<div className='relative'>
									{item.icon}
									{item.badge > 0 && (
										<span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
											{item.badge}
										</span>
									)}
								</div>
								<span>{item.label}</span>
							</NavLink>
						</li>
					))}
				</ul>
			</nav>

			{/* Logout Button */}
			<button
				onClick={logout}
				className='w-full flex items-center gap-3 px-4 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0 mt-2'>
				<FiLogOut size={20} />
				<span>Logout</span>
			</button>

			{/* User Profile Section */}
			<div className='pt-2 border-t border-gray-200 dark:border-gray-700 shrink-0 mt-2'>
				<div className='flex items-center gap-3 mt-4'>
					<ProfilePhoto
						src={user?.profilePhoto}
						alt='Profile'
						className='w-10 h-10 rounded-full'
					/>
					<div>
						<p className='font-medium text-gray-900 dark:text-white'>
							{user?.username}
						</p>
						<p className='text-sm text-gray-500 dark:text-gray-400'>
							{user?.email}
						</p>
					</div>
				</div>
			</div>

			{/* Copyright */}
			<div className='text-center text-xs text-gray-400 dark:text-gray-600 mt-2 shrink-0'>
				© {new Date().getFullYear()} Friendly by Yawe Arthur Shalom-YAS. All
				rights reserved.
			</div>
		</div>
	);
};

export default Sidebar;
