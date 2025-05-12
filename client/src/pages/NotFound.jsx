import { Link } from "react-router-dom";
import { FiHome } from "react-icons/fi";

const NotFound = () => {
	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4'>
			<div className='text-center'>
				<h1 className='text-9xl font-bold text-blue-600 dark:text-blue-400'>
					404
				</h1>
				<h2 className='mt-4 text-3xl font-bold text-gray-900 dark:text-white'>
					Page Not Found
				</h2>
				<p className='mt-2 text-lg text-gray-600 dark:text-gray-400'>
					The page you are looking for doesn't exist or has been moved.
				</p>
				<Link
					to='/'
					className='mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'>
					<FiHome size={20} />
					<span>Back to Home</span>
				</Link>
			</div>
		</div>
	);
};

export default NotFound;