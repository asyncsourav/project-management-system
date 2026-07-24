import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useCallStore } from '../store/useCallStore';

const SocketContext = createContext(null);

export const SocketProvider = ({ children, user: userProp }) => {
  const auth = useAuth();
  const user = userProp || auth?.user;

  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});
  const [activeChatUserId, setActiveChatUserId] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?._id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: { userId: user._id, user },
      query: { userId: user._id },
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Online Users Initial List Listener
    newSocket.on('online_users_list', (userIds) => {
      if (Array.isArray(userIds)) {
        setOnlineUsers(new Set(userIds));
      }
    });

    // Dynamic Online Status Listeners
    newSocket.on('user_online', ({ userId }) => {
      if (userId) {
        setOnlineUsers((prev) => new Set([...prev, userId]));
      }
    });

    newSocket.on('user_offline', ({ userId }) => {
      if (userId) {
        setOnlineUsers((prev) => {
          const updated = new Set(prev);
          updated.delete(userId);
          return updated;
        });
      }
    });

    // Centralized WebRTC Call Signaling Listeners -> useCallStore
    newSocket.on('incoming_call', (data) => {
      useCallStore.getState().setIncomingCall(data);
    });

    newSocket.on('call_accepted', (data) => {
      useCallStore.getState().handleCallAccepted(data);
    });

    newSocket.on('ice_candidate', (data) => {
      useCallStore.getState().handleIceCandidate(data);
    });

    newSocket.on('call_rejected', () => {
      useCallStore.getState().resetCallStore();
    });

    newSocket.on('call_ended', () => {
      useCallStore.getState().resetCallStore();
    });

    // Real-Time Unread Message Counter Listener
    newSocket.on('receive_message', (msg) => {
      const senderId = msg.sender?._id || msg.sender;
      if (senderId && senderId !== user._id && senderId !== activeChatUserId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      }
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      useCallStore.getState().resetCallStore();
    };
  }, [user?._id]);

  // Total Unread Messages Count
  const totalUnreadCount = Object.values(unreadCounts).reduce((acc, curr) => acc + curr, 0);

  const markChatAsRead = useCallback((friendId) => {
    if (!friendId) return;
    setUnreadCounts((prev) => {
      const copy = { ...prev };
      delete copy[friendId];
      return copy;
    });
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        unreadCounts,
        totalUnreadCount,
        markChatAsRead,
        activeChatUserId,
        setActiveChatUserId,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
