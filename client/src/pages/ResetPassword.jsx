import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FiLock, FiEye, FiEyeOff, FiArrowLeft } from "react-icons/fi";
import axios from "axios";
import toast from "react-hot-toast";

const ResetPassword = () => {
	const { token } = useParams();
	const navigate = useNavigate();
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [tokenValid, setTokenValid] = useState(true);
	const [errors, setErrors] = useState({});

	const validateForm = () => {
		const newErrors = {};

		// Password validation
		if (!newPassword) {
			newErrors.newPassword = "Password is required";
		} else if (newPassword.length < 6) {
			newErrors.newPassword = "Password must be at least 6 characters";
		} else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
			newErrors.newPassword =
				"Password must contain at least one uppercase letter, one lowercase letter, and one number";
		}

		// Confirm password validation
		if (!confirmPassword) {
			newErrors.confirmPassword = "Please confirm your password";
		} else if (confirmPassword !== newPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setLoading(true);

		try {
			const response = await axios.post("/api/password-reset/reset", {
				token,
				newPassword,
			});

			if (response.status === 200) {
				toast.success("Password reset successful");
				// Redirect to login page after successful password reset
				setTimeout(() => {
					navigate("/login");
				}, 2000);
			}
		} catch (err) {
			console.error("Password reset error:", err);
			const errorMessage =
				err.response?.data?.message ||
				"An error occurred. Please try again later.";
			toast.error(errorMessage);

			// If token is invalid or expired, mark as invalid
			if (
				err.response?.status === 400 &&
				err.response?.data?.message?.includes("Invalid or expired")
			) {
				setTokenValid(false);
			}
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
						Reset Password
					</h2>
					{tokenValid ? (
						<p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
							Enter your new password below
						</p>
					) : (
						<p className='mt-2 text-sm text-red-600 dark:text-red-400'>
							Invalid or expired reset link. Please request a new password
							reset.
						</p>
					)}
				</div>

				{tokenValid ? (
					<form className='mt-8 space-y-6' onSubmit={handleSubmit}>
						<div className='space-y-4'>
							{/* New Password Input */}
							<div>
								<label
									htmlFor='newPassword'
									className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
									New Password
								</label>
								<div className='mt-1 relative'>
									<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
										<FiLock className='text-gray-400' />
									</div>
									<input
										id='newPassword'
										name='newPassword'
										type={showPassword ? "text" : "password"}
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										className={`block w-full pl-10 pr-10 py-2 border ${
											errors.newPassword
												? "border-red-500"
												: "border-gray-300 dark:border-gray-600"
										} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
										placeholder='••••••••'
									/>
									<div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
										<button
											type='button'
											onClick={() => setShowPassword(!showPassword)}
											className='text-gray-400 hover:text-gray-500 focus:outline-none'>
											{showPassword ? <FiEyeOff /> : <FiEye />}
										</button>
									</div>
								</div>
								{errors.newPassword && (
									<p className='mt-1 text-sm text-red-600'>
										{errors.newPassword}
									</p>
								)}
							</div>

							{/* Confirm Password Input */}
							<div>
								<label
									htmlFor='confirmPassword'
									className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
									Confirm Password
								</label>
								<div className='mt-1 relative'>
									<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
										<FiLock className='text-gray-400' />
									</div>
									<input
										id='confirmPassword'
										name='confirmPassword'
										type={showConfirmPassword ? "text" : "password"}
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										className={`block w-full pl-10 pr-10 py-2 border ${
											errors.confirmPassword
												? "border-red-500"
												: "border-gray-300 dark:border-gray-600"
										} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
										placeholder='••••••••'
									/>
									<div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
										<button
											type='button'
											onClick={() =>
												setShowConfirmPassword(!showConfirmPassword)
											}
											className='text-gray-400 hover:text-gray-500 focus:outline-none'>
											{showConfirmPassword ? <FiEyeOff /> : <FiEye />}
										</button>
									</div>
								</div>
								{errors.confirmPassword && (
									<p className='mt-1 text-sm text-red-600'>
										{errors.confirmPassword}
									</p>
								)}
							</div>
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
										Resetting...
									</span>
								) : (
									"Reset Password"
								)}
							</button>
						</div>
					</form>
				) : (
					<div className='mt-6'>
						<Link
							to='/forgot-password'
							className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
							Request New Reset Link
						</Link>
					</div>
				)}

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

export default ResetPassword;
