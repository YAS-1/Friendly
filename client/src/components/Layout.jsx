import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { useAuth } from "../context/AuthContext";
import SuggestedUsers from "./SuggestedUsers";
import TopNavBar from "./TopNavBar";

const Layout = () => {
	const { user } = useAuth();
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const location = useLocation();

	// Handle responsive layout
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	if (!user) return null;

	return (
		<div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
			<TopNavBar />
			<div className='flex'>
				{/* Desktop Sidebar - hidden on mobile */}
				<div className={`${isMobile ? "hidden" : "w-64 flex-shrink-0"}`}>
					<Sidebar />
				</div>

				{/* Main Content */}
				<div
					className={`flex-1 ${location.pathname === "/" ? "md:pr-80" : ""}`}>
					{/* Mobile Navigation - visible only on mobile */}
					{isMobile && <MobileNav />}

					{/* Main Content Area */}
					<main className='p-2 sm:p-4 md:p-6 max-w-4xl mx-auto'>
						<Outlet />
					</main>
				</div>

				{/* Suggested Users - right column, only on desktop and only on Home page */}
				{location.pathname === "/" && (
					<div className='hidden md:block'>
						<div className='fixed top-24 right-4 md:right-8 w-72 z-30'>
							<SuggestedUsers />
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Layout;
