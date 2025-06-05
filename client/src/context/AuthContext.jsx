/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
	return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();
	const location = useLocation();

	// List of public routes
	const publicRoutes = [
		"/login",
		"/register",
		"/forgot-password",
		"/reset-password",
	];

	// Check if user is logged in on initial load, but skip on public pages
	useEffect(() => {
		// If on a public route, skip auth check
		if (publicRoutes.some((route) => location.pathname.startsWith(route))) {
			setLoading(false);
			return;
		}
		const checkAuthStatus = async () => {
			try {
				const { data } = await axios.get("/auth/myProfile");
				setUser(data.user);
			} catch (error) {
				console.error("Auth check error:", {
					status: error.response?.status,
					message: error.message,
					data: error.response?.data,
					url: error.config?.url,
				});

				if (error.response?.status === 401) {
					// Not authenticated, expected on public pages
					setUser(null);
				} else if (error.response?.status === 404) {
					console.error(
						"User not registered. Please register first."
					);
					setUser(null);
				} else {
					console.error("Authentication error:", error);
					setUser(null);
				}
			} finally {
				setLoading(false);
			}
		};
		checkAuthStatus();
	}, [location.pathname]);

	// Login function
	const login = async (email, password) => {
		try {
			setLoading(true);
			console.log(
				"Attempting login to:",
				axios.defaults.baseURL + "/auth/login"
			);
			const { data } = await axios.post("/auth/login", { email, password });
			setUser(data.user);
			// toast.success("Login successful!");
			navigate("/");
			return true;
		} catch (error) {
			console.error("Login error:", {
				status: error.response?.status,
				message: error.message,
				data: error.response?.data,
				url: error.config?.url,
			});

			if (error.response?.status === 404) {
				toast.error(
					"User not found. Please register first."
				);
			} else {
				toast.error(error.response?.data?.message || "Login failed");
			}
			return false;
		} finally {
			setLoading(false);
		}
	};

	// Register function
	const register = async (userData) => {
		try {
			setLoading(true);
			const { data } = await axios.post("/auth/createAccount", userData);
			// toast.success("Registration successful! Please login.");
			navigate("/login");
			return true;
		} catch (error) {
			console.error("Registration failed", error);
			toast.error(error.response?.data?.message || "Registration failed");
			return false;
		} finally {
			setLoading(false);
		}
	};

	// Logout function
	const logout = async () => {
		try {
			await axios.post("/auth/logout");
			setUser(null);
			toast.success("Logged out successfully");
			navigate("/login");
		} catch (error) {
			console.error("Logout failed", error);
			toast.error("Logout failed");
		}
	};

	// Update profile
	const updateProfile = async (profileData) => {
		try {
			setLoading(true);
			const formData = new FormData();

			// Append text fields
			if (profileData.username)
				formData.append("username", profileData.username);
			if (profileData.bio) formData.append("bio", profileData.bio);

			// Append files if they exist
			if (profileData.profilePhoto) {
				formData.append("profilePhoto", profileData.profilePhoto);
			}
			if (profileData.coverPhoto) {
				formData.append("coverPhoto", profileData.coverPhoto);
			}

			const { data } = await axios.put("/auth/updateProfile", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});

			setUser(data.user);
			toast.success("Profile updated successfully");
			return true;
		} catch (error) {
			console.error("Profile update failed", error);
			toast.error(error.response?.data?.message || "Profile update failed");
			return false;
		} finally {
			setLoading(false);
		}
	};

	const value = {
		user,
		loading,
		login,
		register,
		logout,
		updateProfile,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
