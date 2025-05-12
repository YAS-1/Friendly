import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FiImage, FiVideo, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import userImage from "../assets/user.png";
// Components
import PostCard from "../components/PostCard";

const Home = () => {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [content, setContent] = useState("");
	const [mediaFiles, setMediaFiles] = useState([]);
	const [mediaPreview, setMediaPreview] = useState([]);
	const [hashtags, setHashtags] = useState("");

	// Fetch posts
	const {
		data: posts,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			const response = await axios.get("/posts");
			return response.data.posts;
		},
	});

	// Create post mutation
	const createPostMutation = useMutation({
		mutationFn: async (postData) => {
			const formData = new FormData();
			formData.append("content", postData.content);
			if (postData.hashtags) {
				formData.append("hashtags", postData.hashtags);
			}
			if (postData.media.length > 0) {
				postData.media.forEach((file) => {
					formData.append("media", file);
				});
			}
			const response = await axios.post("/posts", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			return response.data;
		},
		onSuccess: () => {
			// Reset form
			setContent("");
			setMediaFiles([]);
			setMediaPreview([]);
			setHashtags("");

			// Invalidate and refetch posts
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			toast.success("Post created successfully!");
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Failed to create post");
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();

		if (!content.trim() && mediaFiles.length === 0) {
			toast.error("Post cannot be empty");
			return;
		}

		// Process hashtags: ensure each starts with #
		const processedHashtags = hashtags
			.split(",")
			.map((tag) => {
				const trimmed = tag.trim();
				if (!trimmed) return null;
				return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
			})
			.filter(Boolean)
			.join(",");

		createPostMutation.mutate({
			content,
			media: mediaFiles,
			hashtags: processedHashtags,
		});
	};

	const handleMediaChange = (e) => {
		const files = Array.from(e.target.files);

		if (files.length + mediaFiles.length > 5) {
			toast.error("You can only upload up to 5 media files");
			return;
		}

		setMediaFiles((prev) => [...prev, ...files]);

		// Create preview URLs
		const newPreviews = files.map((file) => ({
			url: URL.createObjectURL(file),
			type: file.type.startsWith("image/") ? "image" : "video",
			name: file.name,
		}));

		setMediaPreview((prev) => [...prev, ...newPreviews]);
	};

	const removeMedia = (index) => {
		setMediaFiles((prev) => prev.filter((_, i) => i !== index));
		setMediaPreview((prev) => {
			// Revoke the object URL to avoid memory leaks
			URL.revokeObjectURL(prev[index].url);
			return prev.filter((_, i) => i !== index);
		});
	};

	return (
		<div className='max-w-7xl mx-auto p-4 flex flex-col md:flex-row gap-12'>
			{/* Feed (center) */}
			<div className='flex-1 min-w-[400px]'>
				<div className='space-y-6 pb-20 md:pb-0'>
					{/* Create Post Card */}
					<div className='bg-white dark:bg-gray-800 rounded-xl shadow p-4'>
						<form onSubmit={handleSubmit}>
							<div className='flex items-start space-x-3'>
								<img
									src={
										user?.profilePhoto
											? `http://localhost:5500${user.profilePhoto}`
											: userImage
									}
									alt='Profile'
									className='w-10 h-10 rounded-full object-cover'
								/>
								<div className='flex-1'>
									<textarea
										value={content}
										onChange={(e) => setContent(e.target.value)}
										placeholder={`What's on your mind, ${user?.username}?`}
										className='w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none'
										rows='3'
									/>
									{/* Hashtags input */}
									<input
										type='text'
										value={hashtags}
										onChange={(e) => setHashtags(e.target.value)}
										placeholder='Add hashtags, separated by commas (e.g. #fun, #react)'
										className='w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 mt-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white'
									/>
									{/* Media Preview */}
									{mediaPreview.length > 0 && (
										<div className='mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2'>
											{mediaPreview.map((media, index) => (
												<div
													key={index}
													className='relative rounded-lg overflow-hidden h-24'>
													{media.type === "image" ? (
														<img
															src={media.url}
															alt='Preview'
															className='w-full h-full object-cover'
														/>
													) : (
														<video
															src={media.url}
															className='w-full h-full object-cover'
														/>
													)}
													<button
														type='button'
														onClick={() => removeMedia(index)}
														className='absolute top-1 right-1 bg-gray-800 bg-opacity-70 text-white rounded-full p-1'>
														<FiX size={16} />
													</button>
												</div>
											))}
										</div>
									)}
									<div className='mt-3 flex items-center justify-between'>
										<div className='flex space-x-2'>
											<label className='cursor-pointer text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 flex items-center'>
												<FiImage className='mr-1' />
												<span className='text-sm'>Image</span>
												<input
													type='file'
													accept='image/*'
													multiple
													onChange={handleMediaChange}
													className='hidden'
												/>
											</label>
											<label className='cursor-pointer text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 flex items-center'>
												<FiVideo className='mr-1' />
												<span className='text-sm'>Video</span>
												<input
													type='file'
													accept='video/*'
													multiple
													onChange={handleMediaChange}
													className='hidden'
												/>
											</label>
										</div>
										<button
											type='submit'
											disabled={createPostMutation.isPending}
											className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'>
											{createPostMutation.isPending ? "Posting..." : "Post"}
										</button>
									</div>
								</div>
							</div>
						</form>
					</div>
					{/* Posts Feed */}
					<div className='space-y-4'>
						{isLoading ? (
							<div className='flex justify-center py-8'>
								<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
							</div>
						) : error ? (
							<div className='text-center py-8 text-red-500 dark:text-red-400'>
								Failed to load posts. Please try again.
							</div>
						) : posts?.length === 0 ? (
							<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
								No posts yet. Be the first to post!
							</div>
						) : (
							posts?.map((post) => <PostCard key={post._id} post={post} />)
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Home;
