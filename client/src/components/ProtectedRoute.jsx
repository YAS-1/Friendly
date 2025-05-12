import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
	const { user, loading } = useAuth();

	// Show loading state while checking authentication
	if (loading) {
		return (
			<div className='flex items-center justify-center h-screen'>
				<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
			</div>
		);
	}

	// Redirect to login if not authenticated
	if (!user) {
		return <Navigate to='/login' replace />;
	}

	// Render children if authenticated
	return children;
};

export default ProtectedRoute;