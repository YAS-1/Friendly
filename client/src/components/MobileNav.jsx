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
import useUnreadCounts from "../hooks/useUnreadCounts";

const MobileNav = () => {
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
		{
			path: "#",
			icon: <FiLogOut size={20} />,
			label: "Logout",
			onClick: logout,
			isButton: true,
		},
	];

	return (
		<div className='fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10'>
			<div className='flex justify-between items-center h-14 px-1'>
				{navItems.map((item) =>
					item.isButton ? (
						<button
							key={item.label}
							onClick={item.onClick}
							className='flex flex-col items-center justify-center px-1 py-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'>
							{item.icon}
							<span className='text-[10px] mt-0.5'>{item.label}</span>
						</button>
					) : (
						<NavLink
							key={item.path}
							to={item.path}
							className={({ isActive }) =>
								`flex flex-col items-center justify-center px-1 py-1 ${
									isActive
										? "text-blue-600 dark:text-blue-400"
										: "text-gray-600 dark:text-gray-400"
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
							<span className='text-[10px] mt-0.5'>{item.label}</span>
						</NavLink>
					)
				)}
			</div>
		</div>
	);
};

export default MobileNav;
