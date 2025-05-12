import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const ResetPassword = () => {
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const navigate = useNavigate();
	const location = useLocation();
	const { tempToken, userId } = location.state || {};

	// Redirect if no temp token
	React.useEffect(() => {
		if (!tempToken || !userId) {
			toast.error("Invalid reset session");
			navigate("/forgot-password");
		}
	}, [tempToken, userId, navigate]);

	const resetPasswordMutation = useMutation({
		mutationFn: async () => {
			const response = await axios.post("/password-reset/reset", {
				tempToken,
				userId,
				newPassword,
			});
			return response.data;
		},
		onSuccess: () => {
			toast.success("Password successfully reset");
			navigate("/login");
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Error resetting password");
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();

		if (newPassword.length < 6) {
			toast.error("Password must be at least 6 characters long");
			return;
		}

		if (newPassword !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		resetPasswordMutation.mutate();
	};

	return (
		<div className='max-w-md mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md'>
			<h2 className='text-2xl font-bold mb-6 text-gray-900 dark:text-white'>
				Reset Password
			</h2>
			<form onSubmit={handleSubmit}>
				<div className='mb-4'>
					<input
						type='password'
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						placeholder='New password'
						className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
						required
						minLength={6}
					/>
				</div>
				<div className='mb-4'>
					<input
						type='password'
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						placeholder='Confirm new password'
						className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
						required
						minLength={6}
					/>
				</div>
				<button
					type='submit'
					disabled={resetPasswordMutation.isPending}
					className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50'>
					{resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
				</button>
			</form>
		</div>
	);
};

export default ResetPassword;
