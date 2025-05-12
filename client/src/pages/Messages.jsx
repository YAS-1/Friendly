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
			const response = await axios.get("/messages/chats/recent");
			return response.data.data;
		},
		enabled: !!user,
		refetchInterval: 10000, // Refetch every 10 seconds
	});

	// Fetch messages for active chat
	const { data: messages, isLoading: messagesLoading } = useQuery({
		queryKey: ["messages", activeChat],
		queryFn: async () => {
			if (!activeChat) return [];
			const response = await axios.get(`/messages/${activeChat}`);
			return response.data.data;
		},
		enabled: !!activeChat && !!user,
		refetchInterval: 5000, // Refetch every 5 seconds
	});

	// Fetch user details for active chat
	const { data: chatUser } = useQuery({
		queryKey: ["user", activeChat],
		queryFn: async () => {
			if (!activeChat) return null;
			const response = await axios.get(`/auth/profile/${activeChat}`);
			return response.data.user;
		},
		enabled: !!activeChat && !!user,
	});

	// Fetch followers
	const { data: followers } = useQuery({
		queryKey: ["followers", user?._id],
		queryFn: async () => {
			const response = await axios.get(`/follow/followers/${user?._id}`);
			return response.data.data.map((follow) => follow.follower);
		},
		enabled: !!user,
	});

	// Fetch following
	const { data: following } = useQuery({
		queryKey: ["following", user?._id],
		queryFn: async () => {
			const response = await axios.get(`/follow/following/${user?._id}`);
			return response.data.data.map((follow) => follow.following);
		},
		enabled: !!user,
	});

	// Send message mutation
	const sendMessageMutation = useMutation({
		mutationFn: async (messageData) => {
			return await axios.post("/messages/send", {
				recipientId: messageData.receiver,
				content: messageData.content,
			});
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
		if (!message.trim() || !activeChat) return;

		sendMessageMutation.mutate({
			content: message,
			receiver: activeChat,
		});
	};

	// Format date
	const formatMessageDate = (dateString) => {
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

	return (
		<div className='h-screen flex flex-col md:flex-row overflow-hidden'>
			{/* Conversations sidebar */}
			<div
				className={`w-full md:w-1/3 lg:w-1/4 border-r dark:border-gray-700 flex flex-col ${
					activeChat ? "hidden md:flex" : "flex"
				}`}>
				<div className='p-4 border-b dark:border-gray-700'>
					<h2 className='text-xl font-bold dark:text-white'>Messages</h2>
				</div>

				{/* Add followers/following section above conversations */}
				<div className='p-4 border-b dark:border-gray-700'>
					<h3 className='text-lg font-semibold mb-2 dark:text-white'>
						Start a new chat
					</h3>
					<div className='flex flex-wrap gap-2'>
						{[...(followers || []), ...(following || [])]
							.filter(
								(u, i, arr) => arr.findIndex((x) => x._id === u._id) === i
							)
							.map((u) => (
								<Link
									key={u._id}
									to={`/messages/${u._id}`}
									className='flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors'
									onClick={() => setActiveChat(u._id)}>
									{u.profilePhoto ? (
										<img
											src={`http://localhost:5500${u.profilePhoto}`}
											alt={u.username}
											className='w-8 h-8 rounded-full object-cover'
										/>
									) : (
										<div className='w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center'>
											<FiUser
												size={16}
												className='text-gray-500 dark:text-gray-400'
											/>
										</div>
									)}
									<span className='text-sm text-gray-800 dark:text-gray-200'>
										{u.username}
									</span>
								</Link>
							))}
					</div>
				</div>

				{conversationsLoading ? (
					<div className='flex justify-center p-4'>
						<div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500'></div>
					</div>
				) : conversations?.length === 0 ? (
					<div className='p-4 text-center text-gray-500 dark:text-gray-400'>
						No conversations yet.
					</div>
				) : (
					<div className='overflow-y-auto flex-1'>
						{conversations?.map((conversation) => (
							<Link
								key={conversation.user._id}
								to={`/messages/${conversation.user._id}`}
								className={`flex items-center p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
									activeChat === conversation.user._id
										? "bg-blue-50 dark:bg-blue-900/20"
										: ""
								}`}
								onClick={() => setActiveChat(conversation.user._id)}>
								<div className='relative'>
									{conversation.user.profilePhoto ? (
										<img
											src={`http://localhost:5500${conversation.user.profilePhoto}`}
											alt={conversation.user.username}
											className='w-12 h-12 rounded-full object-cover'
										/>
									) : (
										<div className='w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center'>
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
								<div className='ml-3 flex-1'>
									<div className='flex justify-between items-center'>
										<h3 className='font-medium dark:text-white'>
											{conversation.user.username}
										</h3>
										<span className='text-xs text-gray-500 dark:text-gray-400'>
											{formatMessageDate(conversation.lastMessage?.createdAt)}
										</span>
									</div>
									<p className='text-sm text-gray-500 dark:text-gray-400 truncate'>
										{conversation.lastMessage?.sender === user?._id
											? "You: "
											: ""}
										{conversation.lastMessage?.content || "No messages yet"}
									</p>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>

			{/* Chat area */}
			<div
				className={`flex-1 flex flex-col h-full ${
					!activeChat ? "hidden md:flex" : "flex"
				}`}>
				{!activeChat ? (
					<div className='flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400'>
						Select a conversation to start messaging
					</div>
				) : (
					<>
						{/* Chat header */}
						<div className='flex-shrink-0 p-3 border-b dark:border-gray-700 flex items-center'>
							<button
								className='md:hidden mr-2 text-gray-600 dark:text-gray-300'
								onClick={() => setActiveChat(null)}>
								<FiChevronLeft size={24} />
							</button>
							<Link
								to={`/profile/${chatUser?._id}`}
								className='flex items-center'>
								{chatUser?.profilePhoto ? (
									<img
										src={`http://localhost:5500${chatUser.profilePhoto}`}
										alt={chatUser.username}
										className='w-10 h-10 rounded-full object-cover'
									/>
								) : (
									<div className='w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center'>
										<FiUser
											size={20}
											className='text-gray-500 dark:text-gray-400'
										/>
									</div>
								)}
								<div className='ml-3'>
									<h3 className='font-medium dark:text-white'>
										{chatUser?.username}
									</h3>
									<p className='text-xs text-gray-500 dark:text-gray-400'>
										{chatUser?.isOnline ? "Online" : "Offline"}
									</p>
								</div>
							</Link>
						</div>

						{/* Messages */}
						<div className='flex-1 overflow-y-auto p-4 space-y-4'>
							{messagesLoading ? (
								<div className='flex justify-center py-8'>
									<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
								</div>
							) : messages?.length === 0 ? (
								<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
									No messages yet. Start the conversation!
								</div>
							) : (
								messages?.map((msg) => (
									<div
										key={msg._id}
										className={`flex ${
											msg.sender === user?._id ? "justify-end" : "justify-start"
										}`}>
										<div
											className={`max-w-[70%] rounded-lg p-3 ${
												msg.sender === user?._id
													? "bg-blue-500 text-white"
													: "bg-gray-100 dark:bg-gray-700 dark:text-white"
											}`}>
											<p>{msg.content}</p>
											<span className='text-xs opacity-70 mt-1 block'>
												{formatMessageDate(msg.createdAt)}
											</span>
										</div>
									</div>
								))
							)}
							<div ref={messagesEndRef} />
						</div>

						{/* Message input */}
						<div className='flex-shrink-0 p-4 border-t dark:border-gray-700'>
							<form
								onSubmit={handleSendMessage}
								className='flex items-end gap-2'>
								<div className='flex-1'>
									<textarea
										value={message}
										onChange={(e) => setMessage(e.target.value)}
										placeholder='Type a message...'
										className='w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none'
										rows='1'
									/>
								</div>
								<button
									type='submit'
									disabled={sendMessageMutation.isPending}
									className='p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'>
									<FiSend size={20} />
								</button>
							</form>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default Messages;
