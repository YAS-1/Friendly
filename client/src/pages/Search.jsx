/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { FiSearch, FiUser, FiMessageSquare } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import toast from "react-hot-toast";

const Search = () => {
	const { user } = useAuth();
	const [searchParams, setSearchParams] = useSearchParams();
	const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
	const [searchType, setSearchType] = useState(
		searchParams.get("type") || "all"
	);
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

	// Update URL when search parameters change
	useEffect(() => {
		if (debouncedSearchTerm) {
			setSearchParams({ q: debouncedSearchTerm, type: searchType });
		} else {
			setSearchParams({});
		}
	}, [debouncedSearchTerm, searchType, setSearchParams]);

	// Debounce search term to avoid too many API calls
	useEffect(() => {
		const timerId = setTimeout(() => {
			setDebouncedSearchTerm(searchTerm);
		}, 500);

		return () => {
			clearTimeout(timerId);
		};
	}, [searchTerm]);

	// Fetch search results
	const {
		data: searchResults,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["search", debouncedSearchTerm, searchType],
		queryFn: async () => {
			if (!debouncedSearchTerm) return { users: [], posts: [], hashtags: [] };

			try {
				const response = await axios.get(
					`/search?q=${debouncedSearchTerm}&type=${searchType}`
				);
				return response.data;
			} catch (error) {
				console.error("Error fetching search results:", error);
				toast.error("Failed to fetch search results");
				throw error;
			}
		},
		enabled: debouncedSearchTerm.length > 0,
		keepPreviousData: true,
	});

	// Handle search input change
	const handleSearchChange = (e) => {
		setSearchTerm(e.target.value);
	};

	// Handle search type change
	const handleSearchTypeChange = (type) => {
		setSearchType(type);
	};

	return (
		<div className='max-w-4xl mx-auto p-4'>
			<h1 className='text-2xl font-bold mb-6 dark:text-white'>Search</h1>

			{/* Search input */}
			<div className='relative mb-6'>
				<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
					<FiSearch className='text-gray-500' />
				</div>
				<input
					type='text'
					className='block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
					placeholder='Search for users, posts, or hashtags...'
					value={searchTerm}
					onChange={handleSearchChange}
				/>
			</div>

			{/* Search type tabs */}
			<div className='flex border-b dark:border-gray-700 mb-6'>
				<button
					className={`px-4 py-2 flex items-center gap-1 ${
						searchType === "all"
							? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
							: "text-gray-600 dark:text-gray-400"
					}`}
					onClick={() => handleSearchTypeChange("all")}>
					All
				</button>
				<button
					className={`px-4 py-2 flex items-center gap-1 ${
						searchType === "users"
							? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
							: "text-gray-600 dark:text-gray-400"
					}`}
					onClick={() => handleSearchTypeChange("users")}>
					<FiUser size={16} /> Users
				</button>
				<button
					className={`px-4 py-2 flex items-center gap-1 ${
						searchType === "posts"
							? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
							: "text-gray-600 dark:text-gray-400"
					}`}
					onClick={() => handleSearchTypeChange("posts")}>
					<FiMessageSquare size={16} /> Posts
				</button>
			</div>

			{/* Loading state */}
			{isLoading && debouncedSearchTerm && (
				<div className='flex justify-center py-8'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
				</div>
			)}

			{/* Error state */}
			{error && (
				<div className='text-center py-8 text-red-500 dark:text-red-400'>
					Failed to load search results. Please try again.
				</div>
			)}

			{/* Empty search term */}
			{!debouncedSearchTerm && !isLoading && (
				<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
					Enter a search term to find users, posts, or hashtags.
				</div>
			)}

			{/* No results */}
			{debouncedSearchTerm &&
				!isLoading &&
				!error &&
				searchResults &&
				((searchType === "all" &&
					searchResults.users?.length === 0 &&
					searchResults.posts?.length === 0) ||
					(searchType === "users" && searchResults.users?.length === 0) ||
					(searchType === "posts" && searchResults.posts?.length === 0)) && (
					<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
						No results found for "{debouncedSearchTerm}".
					</div>
				)}

			{/* Search results */}
			{!isLoading && !error && searchResults && (
				<div className='space-y-6'>
					{/* Users section */}
					{(searchType === "all" || searchType === "users") &&
						searchResults.users?.length > 0 && (
							<div>
								<h2 className='text-xl font-semibold mb-3 dark:text-white'>
									Users
								</h2>
								<div className='space-y-2'>
									{searchResults.users.map((user) => (
										<Link
											key={user._id}
											to={`/profile/${user._id}`}
											className='flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors'>
											<div className='flex-shrink-0'>
												{user.profilePhoto ? (
													<img
														src={`http://localhost:5500${user.profilePhoto}`}
														alt={user.username}
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
											</div>
											<div className='ml-3'>
												<p className='font-medium dark:text-white'>
													{user.username}
												</p>
												<p className='text-sm text-gray-500 dark:text-gray-400'>
													{user.bio
														? user.bio.substring(0, 50) +
														  (user.bio.length > 50 ? "..." : "")
														: ""}
												</p>
											</div>
										</Link>
									))}
								</div>
								{searchType === "all" && searchResults.users.length > 5 && (
									<Link
										to={`/search?type=users&q=${searchTerm}`}
										className='block text-center text-blue-600 dark:text-blue-400 hover:underline mt-2'>
										View all users
									</Link>
								)}
							</div>
						)}

					{/* Posts section */}
					{(searchType === "all" || searchType === "posts") &&
						searchResults.posts?.length > 0 && (
							<div>
								<h2 className='text-xl font-semibold mb-3 dark:text-white'>
									Posts
								</h2>
								<div className='space-y-4'>
									{searchResults.posts.map((post) => (
										<PostCard key={post._id} post={post} />
									))}
								</div>
								{searchType === "all" && searchResults.posts.length > 3 && (
									<Link
										to={`/search?type=posts&q=${searchTerm}`}
										className='block text-center text-blue-600 dark:text-blue-400 hover:underline mt-2'>
										View all posts
									</Link>
								)}
							</div>
						)}
				</div>
			)}
		</div>
	);
};

export default Search;
