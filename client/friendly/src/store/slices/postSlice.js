import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  posts: [],
  userPosts: [],
  currentPost: null,
  loading: false,
  error: null,
  hasMore: true,
  page: 1,
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts: (state, action) => {
      if (state.page === 1) {
        state.posts = action.payload;
      } else {
        state.posts = [...state.posts, ...action.payload];
      }
    },
    setUserPosts: (state, action) => {
      state.userPosts = action.payload;
    },
    addPost: (state, action) => {
      state.posts.unshift(action.payload);
    },
    updatePost: (state, action) => {
      const index = state.posts.findIndex((post) => post._id === action.payload._id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
    deletePost: (state, action) => {
      state.posts = state.posts.filter((post) => post._id !== action.payload);
    },
    setCurrentPost: (state, action) => {
      state.currentPost = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setHasMore: (state, action) => {
      state.hasMore = action.payload;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    likePost: (state, action) => {
      const { postId, userId } = action.payload;
      const post = state.posts.find((p) => p._id === postId);
      if (post) {
        if (!post.likes.includes(userId)) {
          post.likes.push(userId);
        } else {
          post.likes = post.likes.filter((id) => id !== userId);
        }
      }
    },
    addComment: (state, action) => {
      const { postId, comment } = action.payload;
      const post = state.posts.find((p) => p._id === postId);
      if (post) {
        post.comments.push(comment);
      }
    },
    removeComment: (state, action) => {
      const { postId, commentId } = action.payload;
      const post = state.posts.find((p) => p._id === postId);
      if (post) {
        post.comments = post.comments.filter((c) => c._id !== commentId);
      }
    },
    resetPosts: (state) => {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
    },
  },
});

export const {
  setPosts,
  setUserPosts,
  addPost,
  updatePost,
  deletePost,
  setCurrentPost,
  setLoading,
  setError,
  setHasMore,
  setPage,
  likePost,
  addComment,
  removeComment,
  resetPosts,
} = postSlice.actions;

export default postSlice.reducer;

// Selectors
export const selectAllPosts = (state) => state.posts.posts;
export const selectUserPosts = (state) => state.posts.userPosts;
export const selectCurrentPost = (state) => state.posts.currentPost;
export const selectPostsLoading = (state) => state.posts.loading;
export const selectPostsError = (state) => state.posts.error;
export const selectHasMore = (state) => state.posts.hasMore;
export const selectPage = (state) => state.posts.page;