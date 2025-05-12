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
} from "react-icons/fi";
import toast from "react-hot-toast";

const Notifications = () => {
	const [activeTab, setActiveTab] = useState("all");
	const queryClient = useQueryClient();

	// Fetch notifications
	const { data: notifications, isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			const response = await axios.get("/notifications");
			return response.data.data;
		},
	});

	// Mark all as read mutation
	const markAllAsReadMutation = useMutation({
		mutationFn: async () => {
			await axios.patch("/notifications/read-all");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			toast.success("All notifications marked as read");
		},
	});

	// Delete all notifications mutation
	const deleteAllMutation = useMutation({
		mutationFn: async () => {
			await axios.delete("/notifications");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			toast.success("All notifications cleared");
		},
	});

	// Filter notifications based on active tab
	const filteredNotifications = notifications?.filter((notification) => {
		if (activeTab === "all") return true;
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
				return `/post/${notification.post._id}`;
			case "follow":
				return `/profile/${notification.sender._id}`;
			case "message":
				return `/messages/${notification.sender._id}`;
			default:
				return "#";
		}
	};

	return (
		<div className='max-w-2xl mx-auto p-4'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-2xl font-bold dark:text-white'>Notifications</h1>
				<div className='flex gap-2'>
					<button
						onClick={() => markAllAsReadMutation.mutate()}
						className='px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-1'
						disabled={markAllAsReadMutation.isPending}>
						<FiCheck size={16} />
						Mark all as read
					</button>
					<button
						onClick={() => deleteAllMutation.mutate()}
						className='px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-1'
						disabled={deleteAllMutation.isPending}>
						<FiTrash2 size={16} />
						Clear all
					</button>
				</div>
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
						activeTab === "like"
							? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
							: "text-gray-600 dark:text-gray-400"
					}`}
					onClick={() => setActiveTab("like")}>
					Likes
				</button>
				<button
					className={`px-4 py-2 ${
						activeTab === "comment"
							? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
							: "text-gray-600 dark:text-gray-400"
					}`}
					onClick={() => setActiveTab("comment")}>
					Comments
				</button>
				<button
					className={`px-4 py-2 ${
						activeTab === "follow"
							? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
							: "text-gray-600 dark:text-gray-400"
					}`}
					onClick={() => setActiveTab("follow")}>
					Follows
				</button>
				<button
					className={`px-4 py-2 ${
						activeTab === "message"
							? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
							: "text-gray-600 dark:text-gray-400"
					}`}
					onClick={() => setActiveTab("message")}>
					Messages
				</button>
			</div>

			{/* Notifications list */}
			{isLoading ? (
				<div className='flex justify-center py-8'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
				</div>
			) : filteredNotifications?.length === 0 ? (
				<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
					No notifications yet
				</div>
			) : (
				<div className='space-y-4'>
					{filteredNotifications?.map((notification) => (
						<Link
							key={notification._id}
							to={getNotificationLink(notification)}
							className={`block p-4 rounded-lg transition-colors ${
								notification.read
									? "bg-white dark:bg-gray-800"
									: "bg-blue-50 dark:bg-blue-900/20"
							}`}>
							<div className='flex items-start gap-4'>
								<div className='flex-shrink-0'>
									{notification.sender.profilePhoto ? (
										<img
											src={`http://localhost:5500${notification.sender.profilePhoto}`}
											alt={notification.sender.username}
											className='w-12 h-12 rounded-full object-cover'
										/>
									) : (
										<div className='w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center'>
											<span className='text-xl font-semibold text-gray-500 dark:text-gray-400'>
												{notification.sender.username[0].toUpperCase()}
											</span>
										</div>
									)}
								</div>
								<div className='flex-1'>
									<div className='flex items-center gap-2'>
										{getNotificationIcon(notification.type)}
										<p className='text-gray-800 dark:text-gray-200'>
											{getNotificationMessage(notification)}
										</p>
									</div>
									{notification.type === "comment" && notification.post && (
										<p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
											{notification.post.content.substring(0, 100)}
											{notification.post.content.length > 100 ? "..." : ""}
										</p>
									)}
									<span className='text-xs text-gray-500 dark:text-gray-400 mt-1 block'>
										{new Date(notification.createdAt).toLocaleDateString()}
									</span>
								</div>
							</div>
						</Link>
					))}
				</div>
			)}
		</div>
	);
};

export default Notifications;
