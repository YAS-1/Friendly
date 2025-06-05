import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const useUnreadCounts = () => {
  // Fetch unread notifications count
  const { data: unreadNotifications } = useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: async () => {
      try {
        const response = await axios.get("/notifications/unread/count");
        return response.data.data.count;
      } catch (error) {
        console.error("Error fetching unread notifications count:", error);
        return 0;
      }
    },
    refetchInterval: 5000, // Refetch every 5 seconds instead of 30
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 0, // Always consider data stale to ensure fresh data
  });

  // Fetch unread messages count
  const { data: unreadMessages } = useQuery({
    queryKey: ["unreadMessages"],
    queryFn: async () => {
      try {
        const response = await axios.get("/messages/unread/count");
        return response.data.data.count;
      } catch (error) {
        console.error("Error fetching unread messages count:", error);
        return 0;
      }
    },
    refetchInterval: 5000, // Refetch every 5 seconds instead of 30
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 0, // Always consider data stale to ensure fresh data
  });

  return {
    unreadNotifications: unreadNotifications || 0,
    unreadMessages: unreadMessages || 0,
  };
};

export default useUnreadCounts; 