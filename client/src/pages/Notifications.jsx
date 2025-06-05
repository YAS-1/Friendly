/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import {
	FiHeart,
	FiMessageSquare,
	FiUserPlus,
	FiMail,
	FiTrash2,
	FiCheck,
	FiCheckCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";

const Notifications = () => {
	const [activeTab, setActiveTab] = useState("all");
	const queryClient = useQueryClient();

	// Fetch notifications
	const {
		data: notifications,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			const response = await axios.get("/notifications");
			return response.data.data;
		},
		refetchInterval: 5000, // Refetch every 5 seconds
		refetchOnWindowFocus: true,
		refetchOnMount: true,
		refetchOnReconnect: true,
	});

	// Mark all as read mutation
	const markAllAsReadMutation = useMutation({
		mutationFn: async () => {
			await axios.patch("/notifications/read-all");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
			toast.success("All notifications marked as read");
		},
		onError: (error) => {
			toast.error(
				error.response?.data?.message || "Failed to mark notifications as read"
			);
		},
	});

	// Mark single notification as read mutation
	const markAsReadMutation = useMutation({
		mutationFn: async (notificationId) => {
			await axios.patch(`/notifications/read/${notificationId}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
			toast.success("Notification marked as read");
		},
		onError: (error) => {
			toast.error(
				error.response?.data?.message || "Failed to mark notification as read"
			);
		},
	});

	// Delete single notification mutation
	const deleteNotificationMutation = useMutation({
		mutationFn: async (notificationId) => {
			await axios.delete(`/notifications/${notificationId}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
			toast.success("Notification deleted");
		},
		onError: (error) => {
			toast.error(
				error.response?.data?.message || "Failed to delete notification"
			);
		},
	});

	// Delete all notifications mutation
	const deleteAllMutation = useMutation({
		mutationFn: async () => {
			await axios.delete("/notifications");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			queryClient.invalidateQueries({ queryKey: ["unreadNotifications"] });
			toast.success("All notifications cleared");
		},
		onError: (error) => {
			toast.error(
				error.response?.data?.message || "Failed to clear notifications"
			);
		},
	});

	// Filter notifications based on active tab
	const filteredNotifications = notifications?.filter((notification) => {
		if (activeTab === "all") return true;
		if (activeTab === "unread") return !notification.read;
		if (activeTab === "read") return notification.read;
		return notification.type === activeTab;
	});

	// Get notification icon based on type
	const getNotificationIcon = (type) => {
		switch (type) {
			case "like":
				return <FiHeart className='text-red-500' />;
			case "comment":
				return <FiMessageSquare className='text-blue-500' />;
			case "follow":
				return <FiUserPlus className='text-green-500' />;
			case "message":
				return <FiMail className='text-purple-500' />;
			default:
				return null;
		}
	};

	// Get notification message based on type
	const getNotificationMessage = (notification) => {
		const username = notification.sender.username;
		switch (notification.type) {
			case "like":
				return `${username} liked your post`;
			case "comment":
				return `${username} commented on your post`;
			case "follow":
				return `${username} started following you`;
			case "message":
				return `${username} sent you a message`;
			default:
				return "";
		}
	};

	// Get notification link based on type
	const getNotificationLink = (notification) => {
		switch (notification.type) {
			case "like":
			case "comment":
				if (notification.post?._id) {
					return `/post/${notification.post._id}`;
				}
				return null;
			case "follow":
				return `/profile/${notification.sender._id}`;
			case "message":
				return `/messages/${notification.sender._id}`;
			default:
				return null;
		}
	};

	return (
		<div className='max-w-4xl mx-auto p-2 sm:p-4'>
			<div className='bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden'>
				{/* Notifications Header */}
				<div className='p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700'>
					<div className='flex items-center justify-between'>
						<h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
							Notifications
						</h1>
						<div className='flex items-center space-x-2'>
							<button
								onClick={() => markAllAsReadMutation.mutate()}
								disabled={markAllAsReadMutation.isPending}
								className='px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
								{markAllAsReadMutation.isPending ? (
									<div className='animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500'></div>
								) : (
									<>
										<FiCheckCircle className='inline-block mr-1' />
										Mark all as read
									</>
								)}
							</button>
							<button
								onClick={() => deleteAllMutation.mutate()}
								disabled={deleteAllMutation.isPending}
								className='px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
								{deleteAllMutation.isPending ? (
									<div className='animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500'></div>
								) : (
									<>
										<FiTrash2 className='inline-block mr-1' />
										Clear all
									</>
								)}
							</button>
						</div>
					</div>
				</div>

				{/* Tabs */}
				<div className='border-b border-gray-200 dark:border-gray-700'>
					<div className='flex space-x-4 px-4'>
						<button
							onClick={() => setActiveTab("all")}
							className={`py-3 px-1 border-b-2 font-medium text-sm ${
								activeTab === "all"
									? "border-blue-500 text-blue-600 dark:text-blue-400"
									: "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
							}`}>
							All
						</button>
						<button
							onClick={() => setActiveTab("unread")}
							className={`py-3 px-1 border-b-2 font-medium text-sm ${
								activeTab === "unread"
									? "border-blue-500 text-blue-600 dark:text-blue-400"
									: "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
							}`}>
							Unread
						</button>
						<button
							onClick={() => setActiveTab("read")}
							className={`py-3 px-1 border-b-2 font-medium text-sm ${
								activeTab === "read"
									? "border-blue-500 text-blue-600 dark:text-blue-400"
									: "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
							}`}>
							Read
						</button>
					</div>
				</div>

				{/* Notifications List */}
				<div className='divide-y divide-gray-200 dark:divide-gray-700'>
					{isLoading ? (
						<div className='flex justify-center py-8'>
							<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
						</div>
					) : error ? (
						<div className='p-4 text-center text-red-500 dark:text-red-400'>
							Failed to load notifications
						</div>
					) : filteredNotifications?.length === 0 ? (
						<div className='p-8 text-center text-gray-500 dark:text-gray-400'>
							No notifications {activeTab !== "all" ? `in ${activeTab}` : ""}
						</div>
					) : (
						filteredNotifications?.map((notification) => (
							<div
								key={notification._id}
								className={`p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 ${
									!notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
								}`}>
								<div className='flex items-start space-x-3'>
									<Link
										to={`/profile/${notification.sender._id}`}
										className='flex-shrink-0'>
										{notification.sender.profilePhoto ? (
											<img
												src={
													notification.sender.profilePhoto.startsWith("http")
														? notification.sender.profilePhoto
														: `http://localhost:5500${notification.sender.profilePhoto}`
												}
												alt={notification.sender.username}
												className='w-10 h-10 rounded-full object-cover'
											/>
										) : (
											<div className='w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center'>
												<span className='text-xl font-semibold text-gray-500 dark:text-gray-400'>
													{notification.sender.username[0].toUpperCase()}
												</span>
											</div>
										)}
									</Link>
									<div className='flex-1 min-w-0'>
										<div className='flex items-center justify-between'>
											<div className='flex items-center space-x-1'>
												<Link
													to={`/profile/${notification.sender._id}`}
													className='font-medium text-gray-900 dark:text-white hover:underline text-sm sm:text-base'>
													{notification.sender.username}
												</Link>
												<span className='text-gray-600 dark:text-gray-400 text-sm sm:text-base'>
													{getNotificationMessage(notification)}
												</span>
												{notification.type === "like" ||
												notification.type === "comment" ? (
													getNotificationLink(notification) ? (
														<Link
															to={getNotificationLink(notification)}
															className='text-blue-600 dark:text-blue-400 hover:underline text-sm sm:text-base'>
															your post
														</Link>
													) : (
														<span className='text-gray-500 dark:text-gray-400 text-sm sm:text-base'>
															(post has been deleted)
														</span>
													)
												) : null}
											</div>
											<div className='flex items-center space-x-2'>
												<span className='text-xs text-gray-500 dark:text-gray-400'>
													{new Date(
														notification.createdAt
													).toLocaleDateString()}
												</span>
												{!notification.read && (
													<button
														onClick={() =>
															markAsReadMutation.mutate(notification._id)
														}
														disabled={markAsReadMutation.isPending}
														className='p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed'>
														{markAsReadMutation.isPending ? (
															<div className='animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500'></div>
														) : (
															<FiCheck size={16} />
														)}
													</button>
												)}
												<button
													onClick={() =>
														deleteNotificationMutation.mutate(notification._id)
													}
													className='p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors'>
													<FiTrash2 size={16} />
												</button>
											</div>
										</div>
										{notification.type === "comment" && notification.post && (
											<p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
												{notification.post.content.substring(0, 100)}
												{notification.post.content.length > 100 ? "..." : ""}
											</p>
										)}
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
};

export default Notifications;
