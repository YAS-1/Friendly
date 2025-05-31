import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState({});
	const { login, loading } = useAuth();

	const validateForm = () => {
		const newErrors = {};

		// Email validation
		if (!email) {
			newErrors.email = "Email is required";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			newErrors.email = "Invalid email format";
		}

		// Password validation
		if (!password) {
			newErrors.password = "Password is required";
		} else if (password.length < 6) {
			newErrors.password = "Password must be at least 6 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (validateForm()) {
			try {
				await login(email, password);
				toast.success("Login successful");
			} catch (error) {
				const errorMessage =
					error.response?.data?.message || "Login failed. Please try again.";
				toast.error(errorMessage);
				if (error.response?.data?.field) {
					setErrors((prev) => ({
						...prev,
						[error.response.data.field]: errorMessage,
					}));
				}
			}
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4'>
			<div className='max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md'>
				<div className='text-center'>
					<h1
						className='text-3xl font-bold text-blue-600 dark:text-blue-400'
						style={{ fontFamily: "Pacifico, cursive" }}>
						Friendly
					</h1>
					<h2 className='mt-6 text-2xl font-bold text-gray-900 dark:text-white'>
						Sign in to your account
					</h2>
					<p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
						Or{" "}
						<Link
							to='/register'
							className='font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400'>
							create a new account
						</Link>
					</p>
				</div>

				<form className='mt-8 space-y-6' onSubmit={handleSubmit}>
					<div className='space-y-4'>
						{/* Email Input */}
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
										errors.email
											? "border-red-500"
											: "border-gray-300 dark:border-gray-600"
									} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
									placeholder='you@example.com'
									required
								/>
							</div>
							{errors.email && (
								<p className='mt-1 text-sm text-red-600'>{errors.email}</p>
							)}
						</div>

						{/* Password Input */}
						<div>
							<label
								htmlFor='password'
								className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
								Password
							</label>
							<div className='mt-1 relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<FiLock className='text-gray-400' />
								</div>
								<input
									id='password'
									name='password'
									type={showPassword ? "text" : "password"}
									autoComplete='current-password'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className={`block w-full pl-10 pr-10 py-2 border ${
										errors.password
											? "border-red-500"
											: "border-gray-300 dark:border-gray-600"
									} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
									placeholder='••••••••'
									required
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
							{errors.password && (
								<p className='mt-1 text-sm text-red-600'>{errors.password}</p>
							)}
						</div>
					</div>

					<div className='flex items-center justify-between'>
						<div className='flex items-center'>
							<input
								id='remember-me'
								name='remember-me'
								type='checkbox'
								className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
							/>
							<label
								htmlFor='remember-me'
								className='ml-2 block text-sm text-gray-900 dark:text-gray-300'>
								Remember me
							</label>
						</div>

						<div className='text-sm'>
							<Link
								to='/forgot-password'
								className='font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400'>
								Forgot your password?
							</Link>
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
									Signing in...
								</span>
							) : (
								"Sign in"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Login;
