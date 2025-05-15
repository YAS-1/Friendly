/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FiEdit2, FiSettings, FiCalendar, FiUsers } from "react-icons/fi";
import ProfileEditModal from "../components/ProfileEditModal";
import PostCard from "../components/PostCard";
import FollowList from "../components/FollowList";
import ProfilePhoto from "../components/ProfilePhoto";
import toast from "react-hot-toast";

const Profile = () => {
	const { userId } = useParams();
	const { user: currentUser, updateProfile } = useAuth();
	const queryClient = useQueryClient();
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [activeTab, setActiveTab] = useState("posts");
	const [followListOpen, setFollowListOpen] = useState(false);
	const [followListType, setFollowListType] = useState(null);

	// Fetch user profile
	const { data: profile, isLoading: profileLoading } = useQuery({
		queryKey: ["profile", userId],
		queryFn: async () => {
			const response = await axios.get(`/auth/profile/${userId}`);
			console.log("Profile data:", response.data.user); // Debug log
			return response.data.user;
		},
		enabled: !!userId,
	});

	// Fetch user posts
	const { data: posts, isLoading: postsLoading } = useQuery({
		queryKey: ["userPosts", userId],
		queryFn: async () => {
			const response = await axios.get(`/posts/user/${userId}`);
			return response.data.posts;
		},
		enabled: !!userId,
	});

	// Fetch followers
	const { data: followers } = useQuery({
		queryKey: ["followers", userId],
		queryFn: async () => {
			const response = await axios.get(`/follow/followers/${userId}`);
			return response.data.data.map((follow) => follow.follower);
		},
		enabled: !!userId,
	});

	// Fetch following
	const { data: following } = useQuery({
		queryKey: ["following", userId],
		queryFn: async () => {
			const response = await axios.get(`/follow/following/${userId}`);
			return response.data.data.map((follow) => follow.following);
		},
		enabled: !!userId,
	});

	// Fetch liked posts
	const { data: likedPosts, isLoading: likesLoading } = useQuery({
		queryKey: ["likedPosts", userId],
		queryFn: async () => {
			const response = await axios.get(
				currentUser?._id === userId
					? "/posts/likes/me"
					: `/posts/likes/user/${userId}`
			);
			return response.data.likedPosts;
		},
		enabled: !!userId,
	});

	// Check if following
	const isOwnProfile = currentUser?._id === userId;
	const profileData = queryClient.getQueryData(["profile", userId]) || profile;
	const { data: followStatus } = useQuery({
		queryKey: ["followStatus", userId],
		queryFn: async () => {
			const response = await axios.get(`/follow/status/${userId}`);
			return response.data.isFollowing;
		},
		enabled: !!userId && !isOwnProfile,
	});
	const isFollowing = followStatus;

	// Follow/Unfollow mutation
	const followMutation = useMutation({
		mutationFn: async () => {
			if (isFollowing) {
				const response = await axios.delete(`/follow/unfollowUser/${userId}`);
				console.log("Unfollow response:", response.data);
				return response.data;
			} else {
				const response = await axios.post(`/follow/followUser/${userId}`);
				console.log("Follow response:", response.data);
				return response.data;
			}
		},
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: ["profile", userId] });
			const previousProfile = queryClient.getQueryData(["profile", userId]);
			queryClient.setQueryData(["profile", userId], (old) => {
				if (!old) return old;
				let newFollowers = Array.isArray(old.followers) ? old.followers : [];
				if (isFollowing) {
					newFollowers = newFollowers.filter((id) => id !== currentUser._id);
				} else {
					newFollowers = [...newFollowers, currentUser._id];
				}
				return { ...old, followers: newFollowers };
			});
			return { previousProfile };
		},
		onError: (err, variables, context) => {
			console.error("Follow/Unfollow error:", err.response?.data || err);
			if (context?.previousProfile) {
				queryClient.setQueryData(["profile", userId], context.previousProfile);
			}
			toast.error(
				err.response?.data?.message || "Failed to update follow status"
			);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["profile", userId] });
			queryClient.invalidateQueries({ queryKey: ["followStatus", userId] });
			queryClient.invalidateQueries({ queryKey: ["followers", userId] });
			queryClient.invalidateQueries({ queryKey: ["following", userId] });
		},
	});

	// Format date
	const formatJoinDate = (dateString) => {
		const options = { year: "numeric", month: "long" };
		return new Date(dateString).toLocaleDateString(undefined, options);
	};

	const handleFollowToggle = () => {
		followMutation.mutate();
	};

	const handleProfileUpdate = async (profileData) => {
		const success = await updateProfile(profileData);
		if (success) {
			setIsEditModalOpen(false);
			queryClient.invalidateQueries({ queryKey: ["profile", userId] });
		}
	};

	const handleOpenFollowList = (type) => {
		setFollowListType(type);
		setFollowListOpen(true);
	};

	const handleCloseFollowList = () => {
		setFollowListOpen(false);
		setFollowListType(null);
	};

	// Defensive: If userId is not defined, show error
	if (!userId) {
		return (
			<div className='flex justify-center py-8 text-red-500'>
				Invalid profile. User ID is missing.
			</div>
		);
	}

	if (profileLoading) {
		return (
			<div className='flex justify-center py-8'>
				<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
			</div>
		);
	}

	return (
		<div className='pb-20 md:pb-0'>
			{/* Cover Photo */}
			<div className='h-48 bg-gray-300 dark:bg-gray-700 rounded-t-xl overflow-hidden relative'>
				{profile?.coverPhoto && (
					<>
						{console.log("Cover photo path:", profile.coverPhoto)}
						<img
							src={`http://localhost:5500${profile.coverPhoto}`}
							alt='Cover'
							className='w-full h-full object-cover'
							onError={(e) => {
								console.error("Error loading cover photo:", e);
								e.target.src =
									"https://via.placeholder.com/800x200?text=No+Cover+Photo";
							}}
						/>
					</>
				)}
			</div>

			{/* Profile Info */}
			<div className='bg-white dark:bg-gray-800 rounded-b-xl shadow p-4 relative'>
				{/* Profile Photo */}
				<div className='absolute -top-16 left-4 w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-600'>
					<ProfilePhoto
						src={profile?.profilePhoto}
						alt={profile?.username}
						className='w-full h-full object-cover object-center'
					/>
				</div>

				{/* Profile Actions */}
				<div className='flex justify-end mb-12'>
					{isOwnProfile ? (
						<button
							onClick={() => setIsEditModalOpen(true)}
							className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'>
							<FiEdit2 size={16} />
							<span>Edit Profile</span>
						</button>
					) : (
						<button
							onClick={handleFollowToggle}
							disabled={followMutation.isPending}
							className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
								isFollowing
									? "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
									: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
							}`}>
							{followMutation.isPending
								? "Loading..."
								: isFollowing
								? "Unfollow"
								: "Follow"}
						</button>
					)}
				</div>

				{/* User Info */}
				<div className='mt-4'>
					<h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
						{profile?.username}
					</h1>
					<p className='text-gray-600 dark:text-gray-400 mt-1'>
						{profile?.bio || "No bio yet"}
					</p>

					<div className='flex items-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400'>
						<div className='flex items-center gap-1'>
							<FiCalendar size={16} />
							<span>Joined {formatJoinDate(profile?.createdAt)}</span>
						</div>
						<button
							onClick={() => handleOpenFollowList("followers")}
							className='flex items-center gap-1 hover:text-blue-500 dark:hover:text-blue-400'>
							<FiUsers size={16} />
							<span>{followers?.length || 0} followers</span>
						</button>
						<button
							onClick={() => handleOpenFollowList("following")}
							className='hover:text-blue-500 dark:hover:text-blue-400'>
							<span>{following?.length || 0} following</span>
						</button>
					</div>
				</div>

				{/* Tabs */}
				<div className='mt-6 border-b border-gray-200 dark:border-gray-700'>
					<div className='flex space-x-8'>
						<button
							onClick={() => setActiveTab("posts")}
							className={`py-2 px-1 font-medium ${
								activeTab === "posts"
									? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
									: "text-gray-500 dark:text-gray-400"
							}`}>
							Posts
						</button>
						<button
							onClick={() => setActiveTab("media")}
							className={`py-2 px-1 font-medium ${
								activeTab === "media"
									? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
									: "text-gray-500 dark:text-gray-400"
							}`}>
							Media
						</button>
						<button
							onClick={() => setActiveTab("likes")}
							className={`py-2 px-1 font-medium ${
								activeTab === "likes"
									? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
									: "text-gray-500 dark:text-gray-400"
							}`}>
							Likes
						</button>
					</div>
				</div>
			</div>

			{/* Content based on active tab */}
			<div className='mt-4 space-y-4'>
				{activeTab === "posts" && (
					<div className='bg-white dark:bg-gray-800 rounded-xl shadow p-4'>
						{postsLoading ? (
							<div className='flex justify-center py-8'>
								<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
							</div>
						) : !Array.isArray(posts) || posts.length === 0 ? (
							<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
								No posts yet.
							</div>
						) : (
							posts.map((post) => <PostCard key={post._id} post={post} />)
						)}
					</div>
				)}

				{activeTab === "media" && (
					<div className='bg-white dark:bg-gray-800 rounded-xl shadow p-4'>
						<div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
							{posts
								?.filter((post) => post.media && post.media.length > 0)
								.flatMap((post) =>
									post.media.map((mediaUrl, index) => {
										const isImage =
											!mediaUrl.includes(".mp4") && !mediaUrl.includes(".webm");
										return (
											<div
												key={`${post._id}-${index}`}
												className='aspect-square overflow-hidden rounded-lg'>
												{isImage ? (
													<img
														src={`http://localhost:5500${mediaUrl}`}
														alt='Media'
														className='w-full h-full object-cover'
													/>
												) : (
													<video
														src={`http://localhost:5500${mediaUrl}`}
														className='w-full h-full object-cover'
													/>
												)}
											</div>
										);
									})
								).length === 0 ? (
								<div className='col-span-full text-center py-8 text-gray-500 dark:text-gray-400'>
									No media posts yet
								</div>
							) : (
								posts
									?.filter((post) => post.media && post.media.length > 0)
									.flatMap((post) =>
										post.media.map((mediaUrl, index) => {
											const isImage =
												!mediaUrl.includes(".mp4") &&
												!mediaUrl.includes(".webm");
											return (
												<div
													key={`${post._id}-${index}`}
													className='aspect-square overflow-hidden rounded-lg'>
													{isImage ? (
														<img
															src={`http://localhost:5500${mediaUrl}`}
															alt='Media'
															className='w-full h-full object-cover'
														/>
													) : (
														<video
															src={`http://localhost:5500${mediaUrl}`}
															className='w-full h-full object-cover'
														/>
													)}
												</div>
											);
										})
									)
							)}
						</div>
					</div>
				)}

				{activeTab === "likes" && (
					<div className='bg-white dark:bg-gray-800 rounded-xl shadow p-4'>
						{likesLoading ? (
							<div className='flex justify-center py-8'>
								<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
							</div>
						) : !likedPosts || likedPosts.length === 0 ? (
							<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
								{isOwnProfile
									? "You haven't liked any posts yet"
									: "No liked posts to show"}
							</div>
						) : (
							likedPosts.map((post) => <PostCard key={post._id} post={post} />)
						)}
					</div>
				)}
			</div>

			{/* Edit Profile Modal */}
			{isEditModalOpen && (
				<ProfileEditModal
					profile={profile}
					onClose={() => setIsEditModalOpen(false)}
					onSave={handleProfileUpdate}
				/>
			)}

			{/* Follow List Modal */}
			<FollowList
				isOpen={followListOpen}
				onClose={handleCloseFollowList}
				type={followListType}
				users={followListType === "followers" ? followers : following}
				title={followListType === "followers" ? "Followers" : "Following"}
			/>
		</div>
	);
};

export default Profile;
