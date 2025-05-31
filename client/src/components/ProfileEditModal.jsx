import { useState } from "react";
import { FiX, FiUpload, FiUser, FiInfo } from "react-icons/fi";

const ProfileEditModal = ({ profile, onClose, onSave }) => {
	const [formData, setFormData] = useState({
		username: profile?.username || "",
		bio: profile?.bio || "",
	});
	const [profilePhoto, setProfilePhoto] = useState(null);
	const [coverPhoto, setCoverPhoto] = useState(null);
	const [profilePhotoPreview, setProfilePhotoPreview] = useState(
		profile?.profilePhoto
			? profile.profilePhoto.startsWith("http")
				? profile.profilePhoto
				: `http://localhost:5500${profile.profilePhoto}`
			: ""
	);
	const [coverPhotoPreview, setCoverPhotoPreview] = useState(
		profile?.coverPhoto
			? profile.coverPhoto.startsWith("http")
				? profile.coverPhoto
				: `http://localhost:5500${profile.coverPhoto}`
			: ""
	);
	const [errors, setErrors] = useState({});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleProfilePhotoChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setProfilePhoto(file);
			setProfilePhotoPreview(URL.createObjectURL(file));
		}
	};

	const handleCoverPhotoChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setCoverPhoto(file);
			setCoverPhotoPreview(URL.createObjectURL(file));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.username) {
			newErrors.username = "Username is required";
		} else if (formData.username.length < 3) {
			newErrors.username = "Username must be at least 3 characters";
		}

		if (formData.bio && formData.bio.length > 160) {
			newErrors.bio = "Bio must be less than 160 characters";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		if (validateForm()) {
			const updatedProfile = {
				...formData,
			};

			if (profilePhoto) {
				updatedProfile.profilePhoto = profilePhoto;
			}

			if (coverPhoto) {
				updatedProfile.coverPhoto = coverPhoto;
			}

			onSave(updatedProfile);
		}
	};

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
			<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto'>
				<div className='flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700'>
					<h2 className='text-xl font-bold text-gray-900 dark:text-white'>
						Edit Profile
					</h2>
					<button
						onClick={onClose}
						className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'>
						<FiX size={24} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className='p-4 space-y-4'>
					{/* Cover Photo */}
					<div className='relative h-32 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden'>
						{coverPhotoPreview && (
							<img
								src={coverPhotoPreview}
								alt='Cover Preview'
								className='w-full h-full object-cover'
							/>
						)}
						<label className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 cursor-pointer group hover:bg-opacity-50'>
							<div className='flex flex-col items-center text-white'>
								<FiUpload size={24} />
								<span className='text-sm mt-1'>Upload Cover Photo</span>
							</div>
							<input
								type='file'
								accept='image/*'
								onChange={handleCoverPhotoChange}
								className='hidden'
							/>
						</label>
					</div>

					{/* Profile Photo */}
					<div className='flex justify-center -mt-8'>
						<div className='relative w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700'>
							{profilePhotoPreview ? (
								<img
									src={profilePhotoPreview}
									alt='Profile Preview'
									className='w-full h-full object-cover'
								/>
							) : (
								<div className='w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-600'>
									<FiUser
										size={32}
										className='text-gray-600 dark:text-gray-400'
									/>
								</div>
							)}
							<label className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 cursor-pointer group hover:bg-opacity-50'>
								<FiUpload size={20} className='text-white' />
								<input
									type='file'
									accept='image/*'
									onChange={handleProfilePhotoChange}
									className='hidden'
								/>
							</label>
						</div>
					</div>

					{/* Username */}
					<div>
						<label
							htmlFor='username'
							className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
							Username
						</label>
						<div className='mt-1 relative'>
							<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
								<FiUser className='text-gray-400' />
							</div>
							<input
								id='username'
								name='username'
								type='text'
								value={formData.username}
								onChange={handleChange}
								className={`block w-full pl-10 pr-3 py-2 border ${
									errors.username
										? "border-red-500"
										: "border-gray-300 dark:border-gray-600"
								} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
								placeholder='Username'
							/>
						</div>
						{errors.username && (
							<p className='mt-1 text-sm text-red-600'>{errors.username}</p>
						)}
					</div>

					{/* Bio */}
					<div>
						<label
							htmlFor='bio'
							className='block text-sm font-medium text-gray-700 dark:text-gray-300'>
							Bio
						</label>
						<div className='mt-1 relative'>
							<div className='absolute top-3 left-3 flex items-start pointer-events-none'>
								<FiInfo className='text-gray-400' />
							</div>
							<textarea
								id='bio'
								name='bio'
								rows='3'
								value={formData.bio}
								onChange={handleChange}
								className={`block w-full pl-10 pr-3 py-2 border ${
									errors.bio
										? "border-red-500"
										: "border-gray-300 dark:border-gray-600"
								} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white`}
								placeholder='Tell us about yourself'
							/>
						</div>
						<p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
							{formData.bio?.length || 0}/160 characters
						</p>
						{errors.bio && (
							<p className='mt-1 text-sm text-red-600'>{errors.bio}</p>
						)}
					</div>

					{/* Action Buttons */}
					<div className='flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
						<button
							type='button'
							onClick={onClose}
							className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
							Cancel
						</button>
						<button
							type='submit'
							className='px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'>
							Save Changes
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ProfileEditModal;
