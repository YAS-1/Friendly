import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { FiSend, FiUser, FiChevronLeft } from "react-icons/fi";
import toast from "react-hot-toast";

const Messages = () => {
	const { user } = useAuth();
	const { userId } = useParams();
	const [message, setMessage] = useState("");
	const [activeChat, setActiveChat] = useState(userId || null);
	const messagesEndRef = useRef(null);
	const queryClient = useQueryClient();

	// Fetch conversations list
	const { data: conversations, isLoading: conversationsLoading } = useQuery({
		queryKey: ["conversations"],
		queryFn: async () => {
			try {
				const response = await axios.get("/messages/chats/recent");
				return response.data.data || [];
			} catch (error) {
				console.error("Error fetching conversations:", error);
				return [];
			}
		},
		enabled: !!user?._id,
		refetchInterval: 10000, // Refetch every 10 seconds
	});

	// Fetch messages for active chat
	const { data: messages, isLoading: messagesLoading } = useQuery({
		queryKey: ["messages", activeChat],
		queryFn: async () => {
			if (!activeChat) return [];
			try {
				const response = await axios.get(`/messages/${activeChat}`);
				return response.data.data || [];
			} catch (error) {
				console.error("Error fetching messages:", error);
				return [];
			}
		},
		enabled: !!activeChat && !!user?._id,
		refetchInterval: 5000, // Refetch every 5 seconds
	});

	// Fetch user details for active chat
	const { data: chatUser } = useQuery({
		queryKey: ["user", activeChat],
		queryFn: async () => {
			if (!activeChat) return null;
			try {
				const response = await axios.get(`/auth/profile/${activeChat}`);
				return response.data.user;
			} catch (error) {
				console.error("Error fetching chat user:", error);
				return null;
			}
		},
		enabled: !!activeChat && !!user?._id,
	});

	// Fetch followers
	const { data: followers = [] } = useQuery({
		queryKey: ["followers", user?._id],
		queryFn: async () => {
			if (!user?._id) return [];
			try {
				const response = await axios.get(`/follow/followers/${user._id}`);
				return response.data.data.map((follow) => follow.follower) || [];
			} catch (error) {
				console.error("Error fetching followers:", error);
				return [];
			}
		},
		enabled: !!user?._id,
	});

	// Fetch following
	const { data: following = [] } = useQuery({
		queryKey: ["following", user?._id],
		queryFn: async () => {
			if (!user?._id) return [];
			try {
				const response = await axios.get(`/follow/following/${user._id}`);
				return response.data.data.map((follow) => follow.following) || [];
			} catch (error) {
				console.error("Error fetching following:", error);
				return [];
			}
		},
		enabled: !!user?._id,
	});

	// Send message mutation
	const sendMessageMutation = useMutation({
		mutationFn: async (messageData) => {
			if (!messageData.receiver || !messageData.content) {
				throw new Error("Missing required message data");
			}
			try {
				return await axios.post("/messages/send", {
					recipientId: messageData.receiver,
					content: messageData.content,
				});
			} catch (error) {
				console.error("Error sending message:", error);
				throw error;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["messages", activeChat] });
			queryClient.invalidateQueries({ queryKey: ["conversations"] });
			setMessage("");
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Failed to send message");
		},
	});

	// Scroll to bottom of messages
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	// Set active chat from URL param
	useEffect(() => {
		if (userId) {
			setActiveChat(userId);
		}
	}, [userId]);

	// Handle sending a message
	const handleSendMessage = (e) => {
		e.preventDefault();
		if (!message.trim() || !activeChat || !user?._id) return;

		sendMessageMutation.mutate({
			content: message,
			receiver: activeChat,
		});
	};

	// Format date
	const formatMessageDate = (dateString) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		const now = new Date();
		const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

		if (diffInDays === 0) {
			return date.toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			});
		} else if (diffInDays === 1) {
			return "Yesterday";
		} else if (diffInDays < 7) {
			return date.toLocaleDateString([], { weekday: "long" });
		} else {
			return date.toLocaleDateString([], { month: "short", day: "numeric" });
		}
	};

	// Filter out users that are already in conversations
	const existingChatUsers = new Set(
		conversations
			?.filter((conv) => conv?.user?._id)
			.map((conv) => conv.user._id) || []
	);
	const newFollowers =
		followers?.filter(
			(follower) => follower?._id && !existingChatUsers.has(follower._id)
		) || [];
	const newFollowing =
		following?.filter(
			(followingUser) =>
				followingUser?._id && !existingChatUsers.has(followingUser._id)
		) || [];

	// Add error boundary
	if (!user?._id) {
		return (
			<div className='flex items-center justify-center h-screen'>
				<div className='text-center'>
					<p className='text-gray-500 dark:text-gray-400'>
						Please log in to access messages
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='max-w-4xl mx-auto p-2 sm:p-4'>
			<div className='bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden'>
				{/* Messages Header */}
				<div className='p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700'>
					<h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
						Messages
					</h1>
				</div>

				{/* Messages Content */}
				<div className='flex flex-col md:flex-row h-[calc(100vh-12rem)]'>
					{/* Conversations List */}
					<div className='w-full md:w-80 border-r border-gray-200 dark:border-gray-700 overflow-y-auto'>
						{conversationsLoading ? (
							<div className='flex justify-center py-4'>
								<div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500'></div>
							</div>
						) : (
							<div className='divide-y divide-gray-200 dark:divide-gray-700'>
								{/* Recent Conversations */}
								{conversations?.length > 0 && (
									<>
										<div className='p-3 text-sm font-medium text-gray-500 dark:text-gray-400'>
											Recent Conversations
										</div>
										{conversations?.map((conversation) => (
											<button
												key={conversation._id}
												onClick={() => setActiveChat(conversation.user?._id)}
												className={`w-full p-3 sm:p-4 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${
													activeChat === conversation.user?._id
														? "bg-gray-50 dark:bg-gray-700"
														: ""
												}`}>
												<div className='relative'>
													{conversation.user?.profilePhoto ? (
														<img
															src={
																conversation.user.profilePhoto.startsWith(
																	"http"
																)
																	? conversation.user.profilePhoto
																	: `http://localhost:5500${conversation.user.profilePhoto}`
															}
															alt={conversation.user?.username || "User"}
															className='w-10 h-10 rounded-full object-cover'
														/>
													) : (
														<div className='w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center'>
															<FiUser
																size={24}
																className='text-gray-500 dark:text-gray-400'
															/>
														</div>
													)}
													{conversation.lastMessage?.read === false &&
														conversation.lastMessage?.sender !== user?._id && (
															<div className='absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
																1
															</div>
														)}
												</div>
												<div className='flex-1 min-w-0'>
													<p className='font-medium text-gray-900 dark:text-white truncate'>
														{conversation.user?.username || "Unknown User"}
													</p>
													<p className='text-sm text-gray-500 dark:text-gray-400 truncate'>
														{conversation.lastMessage?.content ||
															"No messages yet"}
													</p>
												</div>
												{conversation.unreadCount > 0 && (
													<span className='bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full'>
														{conversation.unreadCount}
													</span>
												)}
											</button>
										))}
									</>
								)}

								{/* Start New Chat Section */}
								{(newFollowers.length > 0 || newFollowing.length > 0) && (
									<>
										<div className='p-3 text-sm font-medium text-gray-500 dark:text-gray-400'>
											Start New Chat
										</div>
										{/* Followers */}
										{newFollowers.map((follower) => (
											<button
												key={follower._id}
												onClick={() => setActiveChat(follower._id)}
												className={`w-full p-3 sm:p-4 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${
													activeChat === follower._id
														? "bg-gray-50 dark:bg-gray-700"
														: ""
												}`}>
												<div className='relative'>
													{follower?.profilePhoto ? (
														<img
															src={
																follower.profilePhoto.startsWith("http")
																	? follower.profilePhoto
																	: `http://localhost:5500${follower.profilePhoto}`
															}
															alt={follower?.username || "User"}
															className='w-10 h-10 rounded-full object-cover'
														/>
													) : (
														<div className='w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center'>
															<FiUser
																size={24}
																className='text-gray-500 dark:text-gray-400'
															/>
														</div>
													)}
												</div>
												<div className='flex-1 min-w-0'>
													<p className='font-medium text-gray-900 dark:text-white truncate'>
														{follower?.username || "Unknown User"}
													</p>
													<p className='text-sm text-gray-500 dark:text-gray-400 truncate'>
														Follower
													</p>
												</div>
											</button>
										))}

										{/* Following */}
										{newFollowing.map((followingUser) => (
											<button
												key={followingUser._id}
												onClick={() => setActiveChat(followingUser._id)}
												className={`w-full p-3 sm:p-4 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${
													activeChat === followingUser._id
														? "bg-gray-50 dark:bg-gray-700"
														: ""
												}`}>
												<div className='relative'>
													{followingUser?.profilePhoto ? (
														<img
															src={
																followingUser.profilePhoto.startsWith("http")
																	? followingUser.profilePhoto
																	: `http://localhost:5500${followingUser.profilePhoto}`
															}
															alt={followingUser?.username || "User"}
															className='w-10 h-10 rounded-full object-cover'
														/>
													) : (
														<div className='w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center'>
															<FiUser
																size={24}
																className='text-gray-500 dark:text-gray-400'
															/>
														</div>
													)}
												</div>
												<div className='flex-1 min-w-0'>
													<p className='font-medium text-gray-900 dark:text-white truncate'>
														{followingUser?.username || "Unknown User"}
													</p>
													<p className='text-sm text-gray-500 dark:text-gray-400 truncate'>
														Following
													</p>
												</div>
											</button>
										))}
									</>
								)}
							</div>
						)}
					</div>

					{/* Chat Area */}
					<div className='flex-1 flex flex-col'>
						{activeChat ? (
							<>
								{/* Chat Header */}
								<div className='p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3'>
									<div className='relative'>
										{chatUser?.profilePhoto ? (
											<img
												src={
													chatUser.profilePhoto.startsWith("http")
														? chatUser.profilePhoto
														: `http://localhost:5500${chatUser.profilePhoto}`
												}
												alt={chatUser?.username || "User"}
												className='w-10 h-10 rounded-full object-cover'
											/>
										) : (
											<div className='w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center'>
												<FiUser
													size={24}
													className='text-gray-500 dark:text-gray-400'
												/>
											</div>
										)}
										{chatUser?.isOnline === false && (
											<div className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
												•
											</div>
										)}
									</div>
									<div>
										<p className='font-medium text-gray-900 dark:text-white'>
											{chatUser?.username || "Unknown User"}
										</p>
									</div>
								</div>

								{/* Messages List */}
								<div className='flex-1 overflow-y-auto p-4 bg-[#efeae2] dark:bg-gray-900'>
									{messagesLoading ? (
										<div className='flex justify-center py-4'>
											<div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500'></div>
										</div>
									) : messages?.length === 0 ? (
										<div className='text-center text-gray-500 dark:text-gray-400'>
											No messages yet. Start the conversation!
										</div>
									) : (
										<div className='space-y-2'>
											{messages?.map((message, index) => {
												const showDate =
													index === 0 ||
													new Date(message.createdAt).toDateString() !==
														new Date(
															messages[index - 1].createdAt
														).toDateString();

												const isOwnMessage = message.sender?._id === user?._id;

												return (
													<>
														{showDate && (
															<div className='flex justify-center my-4'>
																<span className='bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-500 dark:text-gray-400 shadow-sm'>
																	{new Date(
																		message.createdAt
																	).toLocaleDateString(undefined, {
																		weekday: "long",
																		year: "numeric",
																		month: "long",
																		day: "numeric",
																	})}
																</span>
															</div>
														)}
														<div
															key={message._id}
															className={`flex w-full ${
																isOwnMessage ? "justify-end" : "justify-start"
															}`}>
															<div
																className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
																	isOwnMessage
																		? "bg-[#dcf8c6] text-black rounded-tr-none"
																		: "bg-white dark:bg-gray-800 text-black dark:text-white rounded-tl-none"
																}`}>
																<div className='text-sm sm:text-base break-words'>
																	{message.content}
																</div>
																<div
																	className={`text-xs mt-1 ${
																		isOwnMessage
																			? "text-gray-500"
																			: "text-gray-500 dark:text-gray-400"
																	}`}>
																	{formatMessageDate(message.createdAt)}
																</div>
															</div>
														</div>
													</>
												);
											})}
											<div ref={messagesEndRef} />
										</div>
									)}
								</div>

								{/* Message Input */}
								<div className='p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'>
									<form
										onSubmit={handleSendMessage}
										className='flex items-center space-x-2'>
										<input
											type='text'
											value={message}
											onChange={(e) => setMessage(e.target.value)}
											placeholder='Type a message...'
											className='flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base'
										/>
										<button
											type='submit'
											disabled={
												!message.trim() || sendMessageMutation.isPending
											}
											className='px-4 py-2 bg-[#00a884] text-white rounded-full hover:bg-[#008f6f] focus:outline-none focus:ring-2 focus:ring-[#00a884] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base'>
											{sendMessageMutation.isPending ? (
												<div className='animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white'></div>
											) : (
												<FiSend className='h-5 w-5' />
											)}
										</button>
									</form>
								</div>
							</>
						) : (
							<div className='flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400'>
								Select a conversation to start messaging
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Messages;
