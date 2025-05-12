import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
	FiHome,
	FiUser,
	FiMessageSquare,
	FiBell,
	FiBookmark,
	FiSearch,
} from "react-icons/fi";

const MobileNav = () => {
	const { user } = useAuth();

	const navItems = [
		{ path: "/", icon: <FiHome size={24} />, label: "Home" },
		{
			path: `/profile/${user?._id}`,
			icon: <FiUser size={24} />,
			label: "Profile",
		},
		{
			path: "/messages",
			icon: <FiMessageSquare size={24} />,
			label: "Messages",
		},
		{
			path: "/notifications",
			icon: <FiBell size={24} />,
			label: "Notifications",
		},
		{ path: "/bookmarks", icon: <FiBookmark size={24} />, label: "Bookmarks" },
		{ path: "/search", icon: <FiSearch size={24} />, label: "Search" },
	];

	return (
		<div className='fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10'>
			<div className='flex justify-around items-center h-16'>
				{navItems.map((item) => (
					<NavLink
						key={item.path}
						to={item.path}
						className={({ isActive }) =>
							`flex flex-col items-center justify-center px-2 py-1 ${
								isActive
									? "text-blue-600 dark:text-blue-400"
									: "text-gray-600 dark:text-gray-400"
							}`
						}>
						{item.icon}
						<span className='text-xs mt-1'>{item.label}</span>
					</NavLink>
				))}
			</div>
		</div>
	);
};

export default MobileNav;