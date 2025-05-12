import { useState } from "react";
import defaultUserImage from "../assets/user.png";

/**
 * ProfilePhoto component that displays a user's profile photo with fallback to default image
 *
 * @param {Object} props Component props
 * @param {string} props.src Source URL of the profile photo
 * @param {string} props.alt Alt text for the image
 * @param {string} props.className Additional CSS classes
 * @param {Function} props.onClick Click handler function
 * @returns {JSX.Element} ProfilePhoto component
 */
const ProfilePhoto = ({
	src,
	alt = "User profile",
	className = "",
	onClick,
	...rest
}) => {
	const [imageError, setImageError] = useState(false);

	const handleImageError = () => {
		setImageError(true);
	};

	// Format the image source URL correctly
	const formatImageUrl = (url) => {
		if (!url) return defaultUserImage;

		// If the URL is already a complete URL, return it as is
		if (url.startsWith("http://") || url.startsWith("https://")) {
			return url;
		}

		// If it's a relative path from the server's Uploads folder, prepend the server URL
		return `http://localhost:5500${url}`;
	};

	return (
		<img
			src={imageError ? defaultUserImage : formatImageUrl(src)}
			alt={alt}
			className={`profile-photo ${className}`}
			onClick={onClick}
			onError={handleImageError}
			{...rest}
		/>
	);
};

export default ProfilePhoto;
