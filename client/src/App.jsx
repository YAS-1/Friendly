import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import axios from "axios";

// Configure axios defaults
axios.defaults.baseURL = "http://localhost:5500/api";
axios.defaults.withCredentials = true;

// Create a client
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
		},
	},
});

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Messages = lazy(() => import("./pages/Messages"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Bookmarks = lazy(() => import("./pages/Bookmarks"));
const Search = lazy(() => import("./pages/Search"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// Layout and auth components
const Layout = lazy(() => import("./components/Layout"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<Suspense
				fallback={
					<div className='flex items-center justify-center h-screen'>
						Loading...
					</div>
				}>
				<Routes>
					<Route path='/login' element={<Login />} />
					<Route path='/register' element={<Register />} />
					<Route path='/forgot-password' element={<ForgotPassword />} />
					<Route path='/reset-password/:token' element={<ResetPassword />} />
					<Route
						path='/'
						element={
							<ProtectedRoute>
								<Layout />
							</ProtectedRoute>
						}>
						<Route index element={<Home />} />
						<Route path='profile/:userId' element={<Profile />} />
						<Route path='messages' element={<Messages />} />
						<Route path='messages/:userId' element={<Messages />} />
						<Route path='notifications' element={<Notifications />} />
						<Route path='bookmarks' element={<Bookmarks />} />
						<Route path='search' element={<Search />} />
					</Route>
					<Route path='*' element={<NotFound />} />
				</Routes>
			</Suspense>
		</QueryClientProvider>
	);
}
