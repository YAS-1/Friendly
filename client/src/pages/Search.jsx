/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { FiSearch, FiUser, FiMessageSquare } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import toast from "react-hot-toast";
import ProfilePhoto from "../components/ProfilePhoto";

const Search = () => {
	const { user } = useAuth();
	const [searchParams, setSearchParams] = useSearchParams();
	const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
	const [searchType, setSearchType] = useState(
		searchParams.get("type") || "all"
	);
	const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

	// Define search types
	const searchTypes = [
		{ value: "all", label: "All" },
		{ value: "users", label: "Users" },
		{ value: "posts", label: "Posts" },
		{ value: "hashtags", label: "Hashtags" },
	];

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
				console.error("Error fetching search results:", {
					status: error.response?.status,
					message: error.message,
					data: error.response?.data,
					url: error.config?.url,
				});
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
		<div className='max-w-4xl mx-auto p-2 sm:p-4'>
			{/* Search Header */}
			<div className='mb-4'>
				<div className='relative'>
					<input
						type='text'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder='Search users, posts, or hashtags...'
						className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base'
					/>
					<FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5' />
				</div>
			</div>

			{/* Search Type Tabs */}
			<div className='flex space-x-2 mb-4 overflow-x-auto pb-2'>
				{searchTypes.map((type) => (
					<button
						key={type.value}
						onClick={() => setSearchType(type.value)}
						className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
							searchType === type.value
								? "bg-blue-600 text-white"
								: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
						}`}>
						{type.label}
					</button>
				))}
			</div>

			{/* Search Results */}
			<div className='space-y-4'>
				{isLoading ? (
					<div className='flex justify-center py-8'>
						<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
					</div>
				) : error ? (
					<div className='text-center py-8 text-red-500 dark:text-red-400'>
						Failed to load search results. Please try again.
					</div>
				) : !debouncedSearchTerm ? (
					<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
						Start typing to search...
					</div>
				) : searchResults.users?.length === 0 &&
				  searchResults.posts?.length === 0 &&
				  searchResults.hashtags?.length === 0 ? (
					<div className='text-center py-8 text-gray-500 dark:text-gray-400'>
						No results found for "{debouncedSearchTerm}"
					</div>
				) : (
					<>
						{/* Users Results */}
						{searchType === "all" || searchType === "users" ? (
							<div className='space-y-2'>
								<h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
									Users
								</h2>
								{searchResults.users?.map((user) => (
									<Link
										key={user._id}
										to={`/profile/${user._id}`}
										className='flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg'>
										<ProfilePhoto
											src={user.profilePhoto}
											alt={user.username}
											className='w-10 h-10 rounded-full'
										/>
										<div>
											<p className='font-medium text-gray-900 dark:text-white'>
												{user.username}
											</p>
											<p className='text-sm text-gray-500 dark:text-gray-400'>
												{user.fullName}
											</p>
										</div>
									</Link>
								))}
							</div>
						) : null}

						{/* Posts Results */}
						{searchType === "all" || searchType === "posts" ? (
							<div className='space-y-2'>
								<h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
									Posts
								</h2>
								{searchResults.posts?.map((post) => (
									<PostCard key={post._id} post={post} />
								))}
							</div>
						) : null}

						{/* Hashtags Results */}
						{searchType === "all" || searchType === "hashtags" ? (
							<div className='space-y-2'>
								<h2 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
									Hashtags
								</h2>
								{searchResults.hashtags?.map((hashtag) => (
									<Link
										key={hashtag}
										to={`/hashtag/${hashtag}`}
										className='flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg'>
										<span className='text-blue-600 dark:text-blue-400 text-lg'>
											#
										</span>
										<div>
											<p className='font-medium text-gray-900 dark:text-white'>
												{hashtag}
											</p>
										</div>
									</Link>
								))}
							</div>
						) : null}
					</>
				)}
			</div>
		</div>
	);
};

export default Search;
