import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
  currentChat: null,
  messages: [],
  loading: false,
  error: null,
  onlineUsers: [],
  typing: {},
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
    },
    addConversation: (state, action) => {
      if (!state.conversations.find(conv => conv._id === action.payload._id)) {
        state.conversations.unshift(action.payload);
      }
    },
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      // Update last message in conversation
      const conversation = state.conversations.find(
        (c) => c._id === action.payload.conversation
      );
      if (conversation) {
        conversation.lastMessage = action.payload;
        // Move conversation to top
        state.conversations = [
          conversation,
          ...state.conversations.filter((c) => c._id !== conversation._id),
        ];
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setTyping: (state, action) => {
      const { userId, conversationId, isTyping } = action.payload;
      state.typing = {
        ...state.typing,
        [conversationId]: isTyping ? userId : null,
      };
    },
    clearChat: (state) => {
      state.currentChat = null;
      state.messages = [];
    },
    updateMessageStatus: (state, action) => {
      const { messageId, status } = action.payload;
      const message = state.messages.find((m) => m._id === messageId);
      if (message) {
        message.status = status;
      }
    },
  },
});

export const {
  setConversations,
  addConversation,
  setCurrentChat,
  setMessages,
  addMessage,
  setLoading,
  setError,
  setOnlineUsers,
  setTyping,
  clearChat,
  updateMessageStatus,
} = messageSlice.actions;

export default messageSlice.reducer;

// Selectors
export const selectConversations = (state) => state.messages.conversations;
export const selectCurrentChat = (state) => state.messages.currentChat;
export const selectMessages = (state) => state.messages.messages;
export const selectMessageLoading = (state) => state.messages.loading;
export const selectMessageError = (state) => state.messages.error;
export const selectOnlineUsers = (state) => state.messages.onlineUsers;
export const selectTyping = (state) => state.messages.typing;