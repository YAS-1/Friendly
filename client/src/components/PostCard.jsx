/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
	FiMoreHorizontal,
	FiMessageSquare,
	FiShare2,
	FiHeart,
	FiBookmark,
} from "react-icons/fi";
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from "react-icons/fa";
import { formatDate } from "../utils/dateUtils";
import { useAuth } from "../context/AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import userImage from "../assets/user.png";
import ProfilePhoto from "./ProfilePhoto";
import toast from "react-hot-toast";

const PostCard = ({ post, activeTab }) => {
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const [showComments, setShowComments] = useState(false);
	const [comment, setComment] = useState("");
	const [menuOpen, setMenuOpen] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	// Format date
	const formatDate = (dateString) => {
		const options = { year: "numeric", month: "short", day: "numeric" };
		return new Date(dateString).toLocaleDateString(undefined, options);
	};

	// Check if user has liked the post
	const isLiked = post.likes.some((like) =>
		typeof like === "string" ? like === user?._id : like._id === user?._id
	);

	// Use isBookmarked field from backend
	const isBookmarked = post.isBookmarked;

	// Use the correct query key for bookmarks
	const bookmarksKey = activeTab ? ["bookmarks", activeTab] : ["bookmarks"];

	// Toggle like mutation
	const likeMutation = useMutation({
		mutationFn: async () => {
			const response = await axios.post(`/posts/${post._id}/like`);
			return response.data;
		},
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: ["posts"] });
			await queryClient.cancelQueries({ queryKey: bookmarksKey });

			const previousPosts = queryClient.getQueryData(["posts"]);
			const previousBookmarks = queryClient.getQueryData(bookmarksKey);

			// Optimistically update posts
			queryClient.setQueryData(["posts"], (old) => {
				if (!old) return old;
				return old.map((p) => {
					if (p._id === post._id) {
						const hasLiked = Array.isArray(p.likes)
							? p.likes.some((like) =>
									typeof like === "string"
										? like === user._id
										: like._id === user._id
							  )
							: false;
						return {
							...p,
							likes: hasLiked
								? p.likes.filter((like) =>
										typeof like === "string"
											? like !== user._id
											: like._id !== user._id
								  )
								: [...p.likes, user._id],
						};
					}
					return p;
				});
			});

			// Optimistically update bookmarks for the current tab
			queryClient.setQueryData(bookmarksKey, (old) => {
				if (!old) return old;
				return old.map((p) => {
					if (p._id === post._id) {
						const hasLiked = Array.isArray(p.likes)
							? p.likes.some((like) =>
									typeof like === "string"
										? like === user._id
										: like._id === user._id
							  )
							: false;
						return {
							...p,
							likes: hasLiked
								? p.likes.filter((like) =>
										typeof like === "string"
											? like !== user._id
											: like._id !== user._id
								  )
								: [...p.likes, user._id],
						};
					}
					return p;
				});
			});

			return { previousPosts, previousBookmarks };
		},
		onError: (err, variables, context) => {
			console.error("Like/Unlike error:", {
				status: err.response?.status,
				message: err.message,
				data: err.response?.data,
				url: err.config?.url,
			});
			if (context?.previousPosts) {
				queryClient.setQueryData(["posts"], context.previousPosts);
			}
			if (context?.previousBookmarks) {
				queryClient.setQueryData(bookmarksKey, context.previousBookmarks);
			}
			toast.error(err.response?.data?.message || "Failed to like post");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: bookmarksKey });
		},
	});

	// Toggle bookmark mutation
	const bookmarkMutation = useMutation({
		mutationFn: async () => {
			const response = await axios.post(`/posts/${post._id}/bookmark`);
			return response.data;
		},
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: ["posts"] });
			const previousPosts = queryClient.getQueryData(["posts"]);
			queryClient.setQueryData(["posts"], (old) => {
				if (!old) return old;
				return old.map((p) => {
					if (p._id === post._id) {
						const wasBookmarked = p.isBookmarked;
						return {
							...p,
							isBookmarked: !wasBookmarked,
						};
					}
					return p;
				});
			});
			return { previousPosts };
		},
		onError: (err, variables, context) => {
			console.error("Bookmark error:", {
				status: err.response?.status,
				message: err.message,
				data: err.response?.data,
				url: err.config?.url,
			});
			if (context?.previousPosts) {
				queryClient.setQueryData(["posts"], context.previousPosts);
			}
			toast.error(err.response?.data?.message || "Failed to bookmark post");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: bookmarksKey });
		},
	});

	// Add comment mutation
	const commentMutation = useMutation({
		mutationFn: async (commentText) => {
			const response = await axios.post(`/posts/${post._id}/comments`, {
				content: commentText,
			});
			return response.data;
		},
		onSuccess: () => {
			setComment("");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: bookmarksKey });
			toast.success("Comment added");
		},
		onError: (error) => {
			console.error("Comment error:", {
				status: error.response?.status,
				message: error.message,
				data: error.response?.data,
				url: error.config?.url,
			});
			toast.error(error.response?.data?.message || "Failed to add comment");
		},
	});

	// Delete post mutation
	const deletePostMutation = useMutation({
		mutationFn: async () => {
			return await axios.delete(`/posts/deletePost/${post._id}`);
		},
		onSuccess: () => {
			toast.success("Post deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["posts"] });
			queryClient.invalidateQueries({ queryKey: bookmarksKey });
		},
		onError: (error) => {
			console.error("Delete post error:", {
				status: error.response?.status,
				message: error.message,
				data: error.response?.data,
				url: error.config?.url,
			});
			toast.error(error.response?.data?.message || "Failed to delete post");
		},
	});

	const handleLike = () => {
		likeMutation.mutate();
	};

	const handleBookmark = () => {
		bookmarkMutation.mutate();
	};

	const handleComment = (e) => {
		e.preventDefault();
		if (!comment.trim()) return;
		commentMutation.mutate(comment);
	};

	return (
		<div className='bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden'>
			{/* Post Header */}
			<div className='p-3 sm:p-4 flex items-center justify-between'>
				<div className='flex items-center space-x-2 sm:space-x-3'>
					<Link to={`/profile/${post.user._id}`}>
						<ProfilePhoto
							src={post.user.profilePhoto}
							alt={post.user.username}
							className='w-8 h-8 sm:w-10 sm:h-10 rounded-full'
						/>
					</Link>
					<div>
						<Link
							to={`/profile/${post.user._id}`}
							className='font-medium text-gray-900 dark:text-white hover:underline text-sm sm:text-base'>
							{post.user.username}
						</Link>
						<p className='text-xs text-gray-500 dark:text-gray-400'>
							{formatDate(post.createdAt)}
						</p>
					</div>
				</div>
				<div className='relative'>
					<button
						onClick={() => setMenuOpen(!menuOpen)}
						className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'>
						<FiMoreHorizontal size={20} />
					</button>
					{menuOpen && (
						<div className='absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700'>
							<div className='py-1'>
								{user?._id === post.user._id && (
									<button
										className='w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
										onClick={() => setShowDeleteDialog(true)}
										disabled={deletePostMutation.isPending}>
										{deletePostMutation.isPending
											? "Deleting..."
											: "Delete Post"}
									</button>
								)}
								<button className='w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'>
									Report Post
								</button>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Post Content */}
			<div className='px-3 sm:px-4 pb-3'>
				<p className='text-gray-800 dark:text-gray-200 whitespace-pre-line text-sm sm:text-base'>
					{post.content}
				</p>

				{/* Hashtags */}
				{post.hashtags && post.hashtags.length > 0 && (
					<div className='mt-2 flex flex-wrap gap-1'>
						{post.hashtags.map((tag, index) => (
							<span
								key={index}
								className='text-blue-600 dark:text-blue-400 text-xs sm:text-sm hover:underline'>
								#{tag}
							</span>
						))}
					</div>
				)}
			</div>

			{/* Media */}
			{post.media && post.media.length > 0 && (
				<div
					className={`grid ${
						post.media.length > 1 ? "grid-cols-2" : "grid-cols-1"
					} gap-1`}>
					{post.media.map((mediaUrl, index) => {
						const isImage =
							!mediaUrl.includes(".mp4") && !mediaUrl.includes(".webm");
						return isImage ? (
							<img
								key={index}
								src={
									mediaUrl.startsWith("http")
										? mediaUrl
										: `http://localhost:5500${mediaUrl}`
								}
								alt='Post media'
								className='w-full h-48 sm:h-64 object-contain'
							/>
						) : (
							<video
								key={index}
								src={
									mediaUrl.startsWith("http")
										? mediaUrl
										: `http://localhost:5500${mediaUrl}`
								}
								controls
								className='w-full h-48 sm:h-64 object-contain'
							/>
						);
					})}
				</div>
			)}

			{/* Post Stats */}
			<div className='px-3 sm:px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400'>
				<span>{post.likes.length} likes</span>
				<span
					onClick={() => setShowComments(!showComments)}
					className='cursor-pointer hover:underline'>
					{post.comments?.length || 0} comments
				</span>
			</div>

			{/* Post Actions */}
			<div className='px-3 sm:px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex justify-around'>
				<button
					onClick={handleLike}
					className={`flex items-center space-x-1 text-sm ${
						isLiked ? "text-red-500" : "text-gray-500 dark:text-gray-400"
					} hover:text-red-500`}>
					<FiHeart className={isLiked ? "fill-current" : ""} />
					<span>Like</span>
				</button>
				<button
					onClick={() => setShowComments(!showComments)}
					className='flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-500'>
					<FiMessageSquare />
					<span>Comment</span>
				</button>
				<button className='flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-green-500'>
					<FiShare2 />
					<span>Share</span>
				</button>
				<button
					onClick={handleBookmark}
					className={`flex items-center space-x-1 text-sm ${
						isBookmarked
							? "text-yellow-500"
							: "text-gray-500 dark:text-gray-400"
					} hover:text-yellow-500`}>
					<FiBookmark className={isBookmarked ? "fill-current" : ""} />
					<span>Save</span>
				</button>
			</div>

			{/* Comments Section */}
			{showComments && (
				<div className='p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700'>
					{/* Add Comment Form */}
					<form onSubmit={handleComment} className='flex space-x-2 mb-4'>
						<input
							type='text'
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							placeholder='Write a comment...'
							className='flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-3 sm:px-4 py-1.5 text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white'
						/>
						<button
							type='submit'
							disabled={!comment.trim() || commentMutation.isPending}
							className='px-3 sm:px-4 py-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm'>
							{commentMutation.isPending ? "Sending..." : "Send"}
						</button>
					</form>

					{/* Comments List */}
					<div className='space-y-3'>
						{post.comments && post.comments.length > 0 ? (
							post.comments.map((comment) => (
								<div key={comment._id} className='flex space-x-2'>
									<ProfilePhoto
										src={comment.user.profilePhoto}
										alt={comment.user.username}
										className='w-6 h-6 sm:w-8 sm:h-8 rounded-full'
									/>
									<div className='flex-1'>
										<div className='bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2'>
											<Link
												to={`/profile/${comment.user._id}`}
												className='font-medium text-gray-900 dark:text-white hover:underline text-sm'>
												{comment.user.username}
											</Link>
											<p className='text-gray-800 dark:text-gray-200 text-sm'>
												{comment.content}
											</p>
										</div>
										<div className='mt-1 text-xs text-gray-500 dark:text-gray-400 flex space-x-2'>
											<span>{formatDate(comment.createdAt)}</span>
											<button className='hover:text-blue-500'>Like</button>
											<button className='hover:text-blue-500'>Reply</button>
										</div>
									</div>
								</div>
							))
						) : (
							<p className='text-center text-gray-500 dark:text-gray-400 text-sm'>
								No comments yet. Be the first to comment!
							</p>
						)}
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{showDeleteDialog && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4'>
					<div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-xs'>
						<h2 className='text-lg font-semibold mb-4 text-gray-900 dark:text-white'>
							Delete Post
						</h2>
						<p className='mb-6 text-gray-700 dark:text-gray-300 text-sm'>
							Are you sure you want to delete this post? This action cannot be
							undone.
						</p>
						<div className='flex justify-end gap-2'>
							<button
								className='px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm'
								onClick={() => setShowDeleteDialog(false)}
								disabled={deletePostMutation.isPending}>
								Cancel
							</button>
							<button
								className='px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 text-sm'
								onClick={() => {
									deletePostMutation.mutate();
									setShowDeleteDialog(false);
								}}
								disabled={deletePostMutation.isPending}>
								{deletePostMutation.isPending ? "Deleting..." : "Delete"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default PostCard;
