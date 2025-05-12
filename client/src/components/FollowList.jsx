import { useState } from "react";
import { Link } from "react-router-dom";
import { FiX } from "react-icons/fi";
import ProfilePhoto from "./ProfilePhoto";

const FollowList = ({ isOpen, onClose, type, users, title }) => {
	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
			<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-hidden'>
				<div className='flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700'>
					<h2 className='text-xl font-bold text-gray-900 dark:text-white'>
						{title}
					</h2>
					<button
						onClick={onClose}
						className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'>
						<FiX size={24} />
					</button>
				</div>

				<div className='overflow-y-auto max-h-[calc(90vh-80px)]'>
					{!users ? (
						<div className='p-4 text-center text-gray-500 dark:text-gray-400'>
							Loading...
						</div>
					) : users.length === 0 ? (
						<div className='p-4 text-center text-gray-500 dark:text-gray-400'>
							No {type} yet
						</div>
					) : (
						<div className='divide-y divide-gray-200 dark:divide-gray-700'>
							{users.map((user) => (
								<Link
									key={user._id}
									to={`/profile/${user._id}`}
									className='flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50'
									onClick={onClose}>
									<ProfilePhoto
										src={user.profilePhoto}
										alt={user.username}
										className='w-12 h-12 rounded-full'
									/>
									<div className='ml-4'>
										<h3 className='font-medium text-gray-900 dark:text-white'>
											{user.username}
										</h3>
										{user.bio && (
											<p className='text-sm text-gray-500 dark:text-gray-400 truncate'>
												{user.bio}
											</p>
										)}
									</div>
								</Link>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default FollowList;
