import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const useUnreadCounts = () => {
  // Fetch unread notifications count
  const { data: unreadNotifications } = useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: async () => {
      const response = await axios.get("/notifications/unread/count");
      return response.data.data.count;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch unread messages count
  const { data: unreadMessages } = useQuery({
    queryKey: ["unreadMessages"],
    queryFn: async () => {
      const response = await axios.get("/messages/unread/count");
      return response.data.data.count;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  return {
    unreadNotifications: unreadNotifications || 0,
    unreadMessages: unreadMessages || 0,
  };
};

export default useUnreadCounts; 