import { useTheme } from "../context/ThemeContext";
import { FiSun, FiMoon } from "react-icons/fi";

const TopNavBar = () => {
	const { theme, toggleTheme } = useTheme();

	return (
		<nav className='w-full flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40'>
			<div
				className='text-2xl font-bold text-blue-600 dark:text-blue-400'
				style={{ fontFamily: "Pacifico, cursive" }}>
				Friendly
			</div>
			<button
				onClick={toggleTheme}
				className='flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none'
				aria-label='Toggle theme'>
				{theme === "dark" ? (
					<FiSun size={20} className='text-yellow-400' />
				) : (
					<FiMoon size={20} className='text-gray-600' />
				)}
				<span className='hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-200'>
					{theme === "dark" ? "Light Mode" : "Dark Mode"}
				</span>
			</button>
		</nav>
	);
};

export default TopNavBar;
