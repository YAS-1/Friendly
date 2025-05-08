import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "./store/slices/authSlice";
import { ThemeProvider } from "./context/ThemeContext";

// Layout Components
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";

// Auth Components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import PasswordReset from "./components/auth/PasswordReset";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
	const isAuthenticated = useSelector(selectIsAuthenticated);
	return isAuthenticated ? children : <Navigate to='/login' />;
};

// Public Route Component (redirects to home if already authenticated)
const PublicRoute = ({ children }) => {
	const isAuthenticated = useSelector(selectIsAuthenticated);
	return !isAuthenticated ? children : <Navigate to='/' />;
};

function App() {
	const isAuthenticated = useSelector(selectIsAuthenticated);

	return (
		<ThemeProvider>
			<Router>
				<div className='min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark'>
					<Toaster
						position='top-center'
						toastOptions={{
							duration: 5000,
							style: {
								background: "#363636",
								color: "#fff",
							},
						}}
					/>

					{/* Show Navbar only when authenticated */}
					{isAuthenticated && <Navbar />}

					<div className='container mx-auto px-4 pt-16'>
						<div className='flex gap-6'>
							{/* Show Sidebar only when authenticated */}
							{isAuthenticated && <Sidebar />}

							<main
								className={`flex-1 ${
									isAuthenticated ? "md:ml-64 lg:ml-72" : ""
								}`}>
								<Routes>
									{/* Public Routes */}
									<Route
										path='/login'
										element={
											<PublicRoute>
												<Login />
											</PublicRoute>
										}
									/>
									<Route
										path='/register'
										element={
											<PublicRoute>
												<Register />
											</PublicRoute>
										}
									/>
									<Route
										path='/reset-password'
										element={
											<PublicRoute>
												<PasswordReset />
											</PublicRoute>
										}
									/>

									{/* Protected Routes */}
									<Route
										path='/'
										element={
											<ProtectedRoute>
												<div>Home Page</div>
											</ProtectedRoute>
										}
									/>
									<Route
										path='/profile/:userId'
										element={
											<ProtectedRoute>
												<div>Profile Page</div>
											</ProtectedRoute>
										}
									/>
									<Route
										path='/messages'
										element={
											<ProtectedRoute>
												<div>Messages Page</div>
											</ProtectedRoute>
										}
									/>
									<Route
										path='/notifications'
										element={
											<ProtectedRoute>
												<div>Notifications Page</div>
											</ProtectedRoute>
										}
									/>
									<Route
										path='/search'
										element={
											<ProtectedRoute>
												<div>Search Page</div>
											</ProtectedRoute>
										}
									/>

									{/* Catch all route */}
									<Route path='*' element={<Navigate to='/' replace />} />
								</Routes>
							</main>
						</div>
					</div>
				</div>
			</Router>
		</ThemeProvider>
	);
}

export default App;
