import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ResetCodeForm = ({ email }) => {
	const [code, setCode] = useState("");
	const navigate = useNavigate();

	const verifyCodeMutation = useMutation({
		mutationFn: async () => {
			const response = await axios.post("/password-reset/verify-code", {
				email,
				code,
			});
			return response.data;
		},
		onSuccess: (data) => {
			// Navigate to reset password page with the temp token
			navigate("/reset-password", {
				state: {
					tempToken: data.tempToken,
					userId: data.userId,
				},
			});
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Error verifying code");
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (code.length !== 4) {
			toast.error("Please enter a valid 4-digit code");
			return;
		}
		verifyCodeMutation.mutate();
	};

	return (
		<div className='max-w-md mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md'>
			<h2 className='text-2xl font-bold mb-6 text-gray-900 dark:text-white'>
				Enter Reset Code
			</h2>
			<p className='mb-4 text-gray-600 dark:text-gray-400'>
				Please enter the 4-digit code sent to your email.
			</p>
			<form onSubmit={handleSubmit}>
				<div className='mb-4'>
					<input
						type='text'
						value={code}
						onChange={(e) =>
							setCode(e.target.value.replace(/\D/g, "").slice(0, 4))
						}
						placeholder='Enter 4-digit code'
						className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
						maxLength={4}
						pattern='\d{4}'
						required
					/>
				</div>
				<button
					type='submit'
					disabled={verifyCodeMutation.isPending}
					className='w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50'>
					{verifyCodeMutation.isPending ? "Verifying..." : "Verify Code"}
				</button>
			</form>
		</div>
	);
};

export default ResetCodeForm;
