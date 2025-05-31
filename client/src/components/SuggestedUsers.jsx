import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiUser, FiUserPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import ProfilePhoto from "./ProfilePhoto";

const SuggestedUsers = () => {
	const queryClient = useQueryClient();

	// Fetch suggested users
	const { data: suggestedUsers, isLoading } = useQuery({
		queryKey: ["suggestedUsers"],
		queryFn: async () => {
			const response = await axios.get("/follow/suggested");
			return response.data.data;
		},
	});

	// Follow user mutation
	const followMutation = useMutation({
		mutationFn: async (userId) => {
			await axios.post(`/follow/followUser/${userId}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
			toast.success("User followed successfully");
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Failed to follow user");
		},
	});

	if (isLoading) {
		return (
			<div className='bg-white dark:bg-gray-800 rounded-xl shadow p-4'>
				<div className='animate-pulse space-y-4'>
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className='flex items-center space-x-4'>
							<div className='rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12'></div>
							<div className='flex-1 space-y-2'>
								<div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4'></div>
								<div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2'></div>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (!suggestedUsers?.length) {
		return null;
	}

	return (
		<div className='bg-white dark:bg-gray-800 rounded-xl shadow p-4'>
			<h2 className='text-xl font-bold mb-4 dark:text-white'>
				Suggested Users
			</h2>
			<div className='space-y-4'>
				{suggestedUsers.map((user) => (
					<div key={user._id} className='flex items-center justify-between'>
						<Link
							to={`/profile/${user._id}`}
							className='flex items-center space-x-3'>
							<ProfilePhoto
								src={user.profilePhoto}
								alt={user.username}
								className='w-12 h-12 rounded-full'
							/>
							<div>
								<h3 className='font-medium dark:text-white'>{user.username}</h3>
								<p className='text-sm text-gray-500 dark:text-gray-400'>
									{user.fullName}
								</p>
							</div>
						</Link>
						<button
							onClick={() => followMutation.mutate(user._id)}
							disabled={followMutation.isPending}
							className='flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'>
							<FiUserPlus size={16} />
							Follow
						</button>
					</div>
				))}
			</div>
		</div>
	);
};

export default SuggestedUsers;
