import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";

const ForgotPassword = () => {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");

	const validateEmail = (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		// Validate email
		if (!email) {
			setError("Email is required");
			toast.error("Email is required");
			return;
		}

		if (!validateEmail(email)) {
			setError("Please enter a valid email address");
			toast.error("Please enter a valid email address");
			return;
		}

		setLoading(true);

		try {
			const response = await axios.post("password-reset/request-reset", {
				email,
			});

			if (response.status === 200) {
				setSuccess(true);
				toast.success("Password reset link sent to your email");
			}
		} catch (err) {
			console.error("Password reset request error:", err);
			const errorMessage =
				err.response?.data?.message ||
				"An error occurred. Please try again later.";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4'>
			<div className='max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md'>
				<div className='text-center'>
					<h1 className='text-3xl font-bold text-blue-600 dark:text-blue-400'>
						Friendly
					</h1>
					<h2 className='mt-6 text-2xl font-bold text-gray-900 dark:text-white'>
						Forgot Password
					</h2>
					{!success ? (
						<p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
							Enter your email address and we'll send you a link to reset your
							password.
						</p>
					) : (
						<p className='mt-2 text-sm text-green-600 dark:text-green-400'>
							We've sent a password reset link to your email. Please check your
							inbox and follow the instructions.
						</p>
					)}
				</div>

				{!success ? (
					<form className='mt-8 space-y-6' onSubmit={handleSubmit}>
						<div>
							<label
								htmlFor='email'
								className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
								Email address
							</label>
							<div className='mt-1 relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<FiMail className='text-gray-400' />
								</div>
								<input
									id='email'
									name='email'
									type='email'
									autoComplete='email'
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className={`block w-full pl-10 pr-3 py-2 border ${
										error
											? "border-red-500"
											: "border-gray-300 dark:border-gray-600"
									} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
									placeholder='you@example.com'
								/>
							</div>
							{error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
						</div>

						<div>
							<button
								type='submit'
								disabled={loading}
								className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'>
								{loading ? (
									<span className='flex items-center'>
										<svg
											className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
											xmlns='http://www.w3.org/2000/svg'
											fill='none'
											viewBox='0 0 24 24'>
											<circle
												className='opacity-25'
												cx='12'
												cy='12'
												r='10'
												stroke='currentColor'
												strokeWidth='4'></circle>
											<path
												className='opacity-75'
												fill='currentColor'
												d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
										</svg>
										Sending...
									</span>
								) : (
									"Send Reset Link"
								)}
							</button>
						</div>
					</form>
				) : null}

				<div className='text-center'>
					<Link
						to='/login'
						className='flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400'>
						<FiArrowLeft className='mr-2' />
						Back to Login
					</Link>
				</div>
			</div>
		</div>
	);
};

export default ForgotPassword;
