import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import ResetCodeForm from "../components/ResetCodeForm";

const ForgotPassword = () => {
	const [email, setEmail] = useState("");
	const [codeSent, setCodeSent] = useState(false);

	const requestResetMutation = useMutation({
		mutationFn: async () => {
			try {
				const response = await axios.post("/password-reset/request", { email });
				return response.data;
			} catch (error) {
				console.error("Error requesting password reset:", {
					status: error.response?.status,
					message: error.message,
					data: error.response?.data,
					url: error.config?.url,
				});
				throw error;
			}
		},
		onSuccess: (data) => {
			toast.success("Reset code sent to your email");
			setCodeSent(true);
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Error sending reset code");
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		requestResetMutation.mutate();
	};

	if (codeSent) {
		return <ResetCodeForm email={email} />;
	}

	return (
		<div className='max-w-md mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md'>
			<h2 className='text-2xl font-bold mb-6 text-gray-900 dark:text-white'>
				Forgot Password
			</h2>
			<p className='mb-4 text-gray-600 dark:text-gray-400'>
				Enter your email address and we'll send you a code to reset your
				password.
			</p>
			<form onSubmit={handleSubmit}>
				<div className='mb-4'>
					<input
						type='email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder='Enter your email'
						className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
						required
					/>
				</div>
				<button
					type='submit'
					disabled={requestResetMutation.isPending}
					className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50'>
					{requestResetMutation.isPending ? "Sending..." : "Send Reset Code"}
				</button>
			</form>
		</div>
	);
};

export default ForgotPassword;
