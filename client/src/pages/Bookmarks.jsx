import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import { FiBookmark } from "react-icons/fi";
import toast from "react-hot-toast";

const Bookmarks = () => {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("all"); // 'all', 'posts', 'media'

	// Fetch bookmarks
	const {
		data: bookmarks,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["bookmarks", activeTab],
		queryFn: async () => {
			try {
				const response = await axios.get(
					`/posts/bookmarks/me?type=${activeTab}`
				);
				return response.data.bookmarkedPosts;
			} catch (error) {
				console.error("Error fetching bookmarks:", {
					status: error.response?.status,
					message: error.message,
					data: error.response?.data,
					url: error.config?.url,
				});
				throw error;
			}
		},
		enabled: !!user,
	});

	// Remove bookmark mutation
	const removeBookmarkMutation = useMutation({
		mutationFn: async (postId) => {
			try {
				return await axios.post(`/posts/${postId}/bookmark`);
			} catch (error) {
				console.error("Error removing bookmark:", {
					status: error.response?.status,
					message: error.message,
					data: error.response?.data,
					url: error.config?.url,
				});
				throw error;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
			toast.success("Bookmark removed successfully");
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Failed to remove bookmark");
		},
	});

	return (
		<div className='max-w-4xl mx-auto p-4'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-2xl font-bold dark:text-white'>Bookmarks</h1>
			</div>

			{/* Tabs */}
			<div className='flex border-b dark:border-gray-700 mb-6'>
				<button
					className={`px-4 py-2 ${
						activeTab === "all"
							? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
							: "text-gray-600 dark:text-gray-400"
					}`}
					onClick={() => setActiveTab("all")}>
					All
				</button>
				<button
					className={`px-4 py-2 ${
						activeTab === "posts"
							? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
							: "text-gray-600 dark:text-gray-400"
					}`}
					onClick={() => setActiveTab("posts")}>
					Posts
				</button>
				<button
					className={`px-4 py-2 ${
						activeTab === "media"
							? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
							: "text-gray-600 dark:text-gray-400"
					}`}
					onClick={() => setActiveTab("media")}>
					Media
				</button>
			</div>

			{/* Loading state */}
			{isLoading && (
				<div className='flex justify-center py-8'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
				</div>
			)}

			{/* Error state */}
			{error && (
				<div className='text-center py-8 text-red-500 dark:text-red-400'>
					Failed to load bookmarks. Please try again.
				</div>
			)}

			{/* Empty state */}
			{!isLoading && !error && (!bookmarks || bookmarks.length === 0) && (
				<div className='text-center py-12'>
					<div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4'>
						<FiBookmark
							size={24}
							className='text-gray-500 dark:text-gray-400'
						/>
					</div>
					<h2 className='text-xl font-semibold mb-2 dark:text-white'>
						No bookmarks yet
					</h2>
					<p className='text-gray-500 dark:text-gray-400 max-w-md mx-auto'>
						When you bookmark posts, they'll appear here for easy access later.
					</p>
				</div>
			)}

			{/* Bookmarks list */}
			{!isLoading && !error && bookmarks && bookmarks.length > 0 && (
				<div className='space-y-4'>
					{bookmarks.map((post) => (
						<PostCard
							key={post._id}
							post={post}
							activeTab={activeTab}
							onRemoveBookmark={() => removeBookmarkMutation.mutate(post._id)}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default Bookmarks;
