import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import useAuth from "../../hooks/useAuth";

const Login = () => {
	const { login, loading, error } = useAuth();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		await login(formData);
	};

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
			<div className='max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg'>
				<div>
					<h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
						Welcome back!
					</h2>
					<p className='mt-2 text-center text-sm text-gray-600'>
						Don't have an account?{" "}
						<Link
							to='/register'
							className='font-medium text-blue-600 hover:text-blue-500'>
							Sign up
						</Link>
					</p>
				</div>

				{error && (
					<div
						className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative'
						role='alert'>
						<span className='block sm:inline'>{error}</span>
					</div>
				)}

				<form className='mt-8 space-y-6' onSubmit={handleSubmit}>
					<div className='rounded-md shadow-sm space-y-4'>
						<div className='relative'>
							<label htmlFor='email' className='sr-only'>
								Email address
							</label>
							<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
								<FaEnvelope className='h-5 w-5 text-gray-400' />
							</div>
							<input
								id='email'
								name='email'
								type='email'
								autoComplete='email'
								required
								className='appearance-none rounded-lg relative block w-full pl-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
								placeholder='Email address'
								value={formData.email}
								onChange={handleChange}
							/>
						</div>

						<div className='relative'>
							<label htmlFor='password' className='sr-only'>
								Password
							</label>
							<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
								<FaLock className='h-5 w-5 text-gray-400' />
							</div>
							<input
								id='password'
								name='password'
								type={showPassword ? "text" : "password"}
								autoComplete='current-password'
								required
								className='appearance-none rounded-lg relative block w-full pl-10 pr-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
								placeholder='Password'
								value={formData.password}
								onChange={handleChange}
							/>
							<button
								type='button'
								className='absolute inset-y-0 right-0 pr-3 flex items-center'
								onClick={() => setShowPassword(!showPassword)}>
								{showPassword ? (
									<FaEyeSlash className='h-5 w-5 text-gray-400' />
								) : (
									<FaEye className='h-5 w-5 text-gray-400' />
								)}
							</button>
						</div>
					</div>

					<div className='flex items-center justify-between'>
						<div className='text-sm'>
							<Link
								to='/reset-password'
								className='font-medium text-blue-600 hover:text-blue-500'>
								Forgot your password?
							</Link>
						</div>
					</div>

					<div>
						<button
							type='submit'
							disabled={loading}
							className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'>
							{loading ? (
								<span className='absolute right-1/2 transform translate-x-1/2'>
									<svg
										className='animate-spin h-5 w-5 text-white'
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
