import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  MessageSquare, Send, CheckCheck, Check, Reply, Users, Search, X, Phone, Video, History, Trash2, Smile, Eraser, ArrowLeft, Trash, GraduationCap, Briefcase
} from 'lucide-react';

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '🎉', '👏', '💯'];

// Helper to format date headers in message stream
const getDayHeaderLabel = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();

  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString([], { month: 'long', day: 'numeric' });
  }
  return d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
};

// Time formatting helper
const formatMessageTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatCallTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();

  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `Today at ${timeStr}`;
  if (isYesterday) return `Yesterday at ${timeStr}`;
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at ${timeStr}`;
};

export const InstantChat = () => {
  const { user } = useAuth();
  const { socket, onlineUsers, initiateCall, activeCall, endCall, markChatAsRead, setActiveChatUserId } = useSocket();

  // Connected friends state
  const [friends, setFriends] = useState([]);
  const [roleFilter, setRoleFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [friendsLoading, setFriendsLoading] = useState(true);

  // Chat room state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Modals state
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [callHistory, setCallHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // 1. Fetch Friends List
  useEffect(() => {
    fetchFriends();
  }, [roleFilter]);

  const fetchFriends = async () => {
    try {
      setFriendsLoading(true);
      const res = await api.get('/chat/friends', {
        params: { role: roleFilter === 'All' ? undefined : roleFilter },
      });
      const friendList = res.data.data.friends || [];
      setFriends(friendList);

      if (!selectedFriend && friendList.length > 0 && window.innerWidth >= 768) {
        setSelectedFriend(friendList[0]);
      }
    } catch (err) {
      console.error('Error fetching chat friends:', err);
    } finally {
      setFriendsLoading(false);
    }
  };

  // 2. Fetch Conversation Messages when Selected Friend Changes
  useEffect(() => {
    if (!selectedFriend?._id) return;

    setActiveChatUserId(selectedFriend._id);
    markChatAsRead(selectedFriend._id);
    setReplyToMessage(null);
    setShowEmojiPicker(false);
    fetchConversationMessages(selectedFriend._id);

    if (socket && socket.connected) {
      socket.emit('mark_read', { senderId: selectedFriend._id });
    }

    return () => {
      setActiveChatUserId(null);
    };
  }, [selectedFriend?._id]);

  const fetchConversationMessages = async (friendId) => {
    try {
      setMessagesLoading(true);
      const res = await api.get(`/chat/messages/${friendId}?limit=100`);
      const msgList = res.data.data.messages || [];
      setMessages(msgList);
      scrollToBottom();
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setMessagesLoading(false);
    }
  };

  // 3. Socket Event Listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      const senderId = msg.sender?._id || msg.sender;
      const recipientId = msg.recipient?._id || msg.recipient;

      // Update message list if current conversation active
      if (
        selectedFriend &&
        (senderId === selectedFriend._id || recipientId === selectedFriend._id)
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        scrollToBottom();

        if (senderId === selectedFriend._id && socket.connected) {
          socket.emit('mark_read', { senderId: selectedFriend._id });
        }
      }

      // Update last message in left contact list
      setFriends((prevFriends) => {
        const partnerId = senderId === user._id ? recipientId : senderId;
        const targetFriend = prevFriends.find((f) => f._id === partnerId);
        if (!targetFriend) return prevFriends;

        const updatedTarget = {
          ...targetFriend,
          lastMessage: msg.content,
          lastMessageDate: msg.createdAt,
        };

        const remaining = prevFriends.filter((f) => f._id !== partnerId);
        return [updatedTarget, ...remaining];
      });
    };

    const handleMessagesRead = (data) => {
      const readerId = data?.readerId || data?.recipientId;
      if (selectedFriend && (selectedFriend._id === readerId || selectedFriend._id?.toString() === readerId?.toString())) {
        setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
      }
    };

    const handleReactionUpdated = (data) => {
      const targetMsgId = data?.messageId || data?._id || data?.message?._id;
      const updatedReactions = data?.reactions || data?.message?.reactions || [];

      if (targetMsgId) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id?.toString() === targetMsgId?.toString()
              ? { ...m, reactions: updatedReactions }
              : m
          )
        );
      }
    };

    const handleUserTyping = ({ userId }) => {
      if (selectedFriend && selectedFriend._id === userId) {
        setIsTyping(true);
      }
    };

    const handleUserStopTyping = ({ userId }) => {
      if (selectedFriend && selectedFriend._id === userId) {
        setIsTyping(false);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('messages_read', handleMessagesRead);
    socket.on('messages_read_by_recipient', handleMessagesRead);
    socket.on('message_reaction_updated', handleReactionUpdated);
    socket.on('reaction_updated', handleReactionUpdated);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('messages_read', handleMessagesRead);
      socket.off('messages_read_by_recipient', handleMessagesRead);
      socket.off('message_reaction_updated', handleReactionUpdated);
      socket.off('reaction_updated', handleReactionUpdated);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [socket, selectedFriend, user]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Jump to Replied Message
  const handleJumpToMessage = (targetMsgId) => {
    if (!targetMsgId) return;
    const targetId = typeof targetMsgId === 'object' ? targetMsgId._id : targetMsgId;
    const elem = document.getElementById(`msg-${targetId}`);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      elem.classList.add('ring-4', 'ring-indigo-500', 'bg-indigo-500/20', 'scale-[1.02]', 'transition-all', 'duration-300', 'rounded-2xl');
      setTimeout(() => {
        elem.classList.remove('ring-4', 'ring-indigo-500', 'bg-indigo-500/20', 'scale-[1.02]');
      }, 2000);
    }
  };

  // Send Message Handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedFriend) return;

    const content = newMessage.trim();
    const replyToObj = replyToMessage;

    setNewMessage('');
    setReplyToMessage(null);
    setShowEmojiPicker(false);

    if (socket && socket.connected) {
      socket.emit('typing_stop', { recipientId: selectedFriend._id });
    }

    const updateUIWithSentMessage = (msgData) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msgData._id)) return prev;
        return [...prev, msgData];
      });
      scrollToBottom();

      setFriends((prevFriends) => {
        const targetFriend = prevFriends.find((f) => f._id === selectedFriend._id);
        if (!targetFriend) return prevFriends;

        const updatedTarget = {
          ...targetFriend,
          lastMessage: msgData.content,
          lastMessageDate: msgData.createdAt,
        };

        const remaining = prevFriends.filter((f) => f._id !== selectedFriend._id);
        return [updatedTarget, ...remaining];
      });
    };

    if (socket && socket.connected) {
      socket.emit(
        'send_message',
        {
          recipientId: selectedFriend._id,
          content,
          replyToId: replyToObj ? replyToObj._id : null,
          replyTo: replyToObj ? replyToObj._id : null,
        },
        (response) => {
          if (response && response.success) {
            updateUIWithSentMessage(response.message);
          } else if (response && response.error) {
            alert(response.error);
          }
        }
      );
    } else {
      try {
        const res = await api.post('/chat/send', {
          recipientId: selectedFriend._id,
          content,
          replyToId: replyToObj ? replyToObj._id : null,
          replyTo: replyToObj ? replyToObj._id : null,
        });
        if (res.data?.data?.message) {
          updateUIWithSentMessage(res.data.data.message);
        }
      } catch (err) {
        console.error('Failed to send message via HTTP fallback:', err);
      }
    }
  };

  // Typing Handler
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !selectedFriend) return;

    socket.emit('typing_start', { recipientId: selectedFriend._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', { recipientId: selectedFriend._id });
    }, 2000);
  };

  // Toggle Emoji Reaction
  const handleToggleEmoji = (messageId, emoji) => {
    if (!socket) return;

    setMessages((prev) =>
      prev.map((m) => {
        if (m._id !== messageId) return m;
        const currentReactions = m.reactions || [];
        const existingIdx = currentReactions.findIndex((r) => (r.user?._id || r.user) === user._id);

        let nextReactions = [...currentReactions];
        if (existingIdx > -1) {
          if (nextReactions[existingIdx].emoji === emoji) {
            nextReactions.splice(existingIdx, 1);
          } else {
            nextReactions[existingIdx] = { user: user._id, emoji };
          }
        } else {
          nextReactions.push({ user: user._id, emoji });
        }
        return { ...m, reactions: nextReactions };
      })
    );

    socket.emit('toggle_reaction', { messageId, emoji });
  };

  // Start Call Handler
  const startCall = (callType) => {
    if (!selectedFriend) return;
    if (activeCall) {
      if (!window.confirm(`You are currently in an active call with ${activeCall.partner?.name || 'another user'}. End current call to call ${selectedFriend.name}?`)) {
        return;
      }
      endCall(activeCall.partner?._id);
    }
    initiateCall(selectedFriend, callType);
  };

  // Call History Modal Handlers
  const openCallHistoryModal = async () => {
    setShowCallHistory(true);
    try {
      setHistoryLoading(true);
      const res = await api.get('/chat/call-history');
      setCallHistory(res.data.data.history || []);
    } catch (err) {
      console.error('Error fetching call history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeleteCallRecord = async (historyId) => {
    try {
      await api.delete(`/chat/call-history/${historyId}`);
      setCallHistory((prev) => prev.filter((item) => item._id !== historyId));
    } catch (err) {
      console.error('Error deleting call log:', err);
    }
  };

  const handleClearAllCallHistory = async () => {
    try {
      await api.delete('/chat/call-history/clear-all');
      setCallHistory([]);
    } catch (err) {
      console.error('Error clearing call history:', err);
    }
  };

  // Clear Chat History Handler
  const handleClearChatHistory = async () => {
    if (!selectedFriend) return;
    if (!window.confirm(`Are you sure you want to clear chat history with ${selectedFriend.name}?`)) return;

    try {
      await api.delete(`/chat/clear-chat/${selectedFriend._id}`);
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear chat:', err);
    }
  };

  // Filter Friends by Search Query
  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-4rem-4px)] mt-[2px] pt-[2px] flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-300">
      {/* Call History Modal */}
      {showCallHistory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Call History Logs
              </h3>
              <div className="flex items-center gap-2">
                {callHistory.length > 0 && (
                  <button
                    onClick={handleClearAllCallHistory}
                    className="px-2.5 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Trash className="w-3.5 h-3.5" /> Clear All Logs
                  </button>
                )}
                <button onClick={() => setShowCallHistory(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800 space-y-1">
              {historyLoading ? (
                <div className="p-8 flex justify-center">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : callHistory.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No call history logs found.</div>
              ) : (
                callHistory.map((item) => (
                  <div key={item._id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                        {item.callType === 'one_to_one_video' ? <Video className="w-4 h-4 text-indigo-500" /> : <Phone className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-200">{item.title || '1-on-1 Call'}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">{formatCallTime(item.startedAt)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCallRecord(item._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete Log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Contacts & Conversations */}
        <div
          className={`w-full md:w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between ${
            selectedFriend ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Conversations
              </h2>
              <button
                onClick={openCallHistoryModal}
                className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs transition-all shadow-sm"
                title="View Call History"
              >
                <History className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Role Filter Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] font-semibold">
              {['All', 'Teacher', 'Student'].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`flex-1 py-1 rounded-lg text-center transition-all ${
                    roleFilter === role ? 'bg-indigo-600 text-white shadow-sm font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Contact List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
            {friendsLoading ? (
              <div className="p-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                No connected contacts found. Connect with teachers or students to start chatting!
              </div>
            ) : (
              filteredFriends.map((friend) => {
                const isOnline = onlineUsers.has(friend._id);
                const isSelected = selectedFriend?._id === friend._id;

                return (
                  <div
                    key={friend._id}
                    onClick={() => setSelectedFriend(friend)}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-600/10 border-l-4 border-indigo-600 text-slate-900 dark:text-slate-100'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {/* Avatar & Online Dot */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-sm border border-indigo-500/30 shadow-md">
                        {friend.name?.charAt(0) || 'U'}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                          isOnline ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'
                        }`}
                      />
                    </div>

                    {/* Contact Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <p className="text-xs font-bold truncate text-slate-900 dark:text-slate-200">{friend.name}</p>
                        {friend.lastMessageDate && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {formatMessageTime(friend.lastMessageDate)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                          {friend.lastMessage || `${friend.role || 'Contact'}`}
                        </p>
                        {friend.unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 bg-indigo-600 text-white rounded-full text-[10px] font-extrabold shadow-sm">
                            {friend.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Chat Conversation Screen */}
        {selectedFriend ? (
          <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
            {/* Chat Room Top Bar */}
            <div className="p-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedFriend(null)}
                  className="md:hidden p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-sm border border-indigo-500/30">
                    {selectedFriend.name?.charAt(0) || 'U'}
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                      onlineUsers.has(selectedFriend._id) ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {selectedFriend.name}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                      {selectedFriend.role === 'Teacher' ? <Briefcase className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                      {selectedFriend.role}
                    </span>
                  </h3>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${onlineUsers.has(selectedFriend._id) ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    {onlineUsers.has(selectedFriend._id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              {/* Quick Action Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startCall('one_to_one_voice')}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 rounded-xl transition-all shadow-sm"
                  title="Start Voice Call"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => startCall('one_to_one_video')}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 rounded-xl transition-all shadow-sm"
                  title="Start Video Call"
                >
                  <Video className="w-4 h-4" />
                </button>
                <button
                  onClick={handleClearChatHistory}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 rounded-xl transition-all shadow-sm"
                  title="Clear Conversation"
                >
                  <Eraser className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Timeline Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-100/70 dark:bg-slate-950/60">
              {messagesLoading ? (
                <div className="p-8 flex justify-center">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs font-semibold">
                  No messages yet. Send a greeting to start chatting with {selectedFriend.name}!
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isSelf = (msg.sender?._id || msg.sender) === user._id;
                  const currentDateHeader = getDayHeaderLabel(msg.createdAt);
                  const prevDateHeader = idx > 0 ? getDayHeaderLabel(messages[idx - 1].createdAt) : null;
                  const showDayDivider = currentDateHeader !== prevDateHeader;

                  return (
                    <React.Fragment key={msg._id || idx}>
                      {showDayDivider && (
                        <div className="flex justify-center my-3">
                          <span className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                            {currentDateHeader}
                          </span>
                        </div>
                      )}

                      <div
                        id={`msg-${msg._id}`}
                        className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} group transition-all duration-300`}
                      >
                        {/* Bubble */}
                        <div
                          className={`max-w-[75%] p-3.5 rounded-2xl text-xs space-y-1.5 shadow-sm relative transition-all ${
                            isSelf
                              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-bl-none'
                          }`}
                        >
                          {/* Replied Message Tag Quote */}
                          {msg.replyTo && (
                            <div
                              onClick={() => handleJumpToMessage(msg.replyTo._id || msg.replyTo)}
                              className={`p-2 rounded-xl text-[11px] cursor-pointer mb-1 border-l-4 transition-all hover:opacity-90 ${
                                isSelf
                                  ? 'bg-indigo-700/80 border-indigo-300 text-indigo-100'
                                  : 'bg-slate-100 dark:bg-slate-950 border-indigo-500 text-slate-800 dark:text-slate-300'
                              }`}
                            >
                              <p className="font-bold flex items-center gap-1 text-[10px]">
                                <Reply className="w-3 h-3 text-indigo-400" /> {msg.replyTo.sender?.name || 'User'}
                              </p>
                              <p className="truncate text-[10px] opacity-90">{msg.replyTo.content}</p>
                            </div>
                          )}

                          <p className="leading-relaxed font-medium whitespace-pre-wrap">{msg.content}</p>

                          {/* Emoji Reaction Chips */}
                          {msg.reactions && msg.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {msg.reactions.map((r, i) => (
                                <button
                                  key={i}
                                  onClick={() => handleToggleEmoji(msg._id, r.emoji)}
                                  className="px-2 py-0.5 bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-[11px] rounded-full border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 transition-all flex items-center gap-1"
                                >
                                  <span>{r.emoji}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Time & Read Status */}
                          <div className="flex items-center justify-end gap-1.5 text-[10px] opacity-75 pt-1">
                            <span>{formatMessageTime(msg.createdAt)}</span>
                            {isSelf && (
                              <span className="flex items-center">
                                {msg.isRead ? (
                                  <CheckCheck className="w-3.5 h-3.5 text-sky-300 font-bold" title="Read" />
                                ) : (
                                  <Check className="w-3.5 h-3.5 opacity-70" title="Sent" />
                                )}
                              </span>
                            )}
                          </div>

                          {/* Reaction & Reply Hover Toolbar */}
                          <div
                            className={`hidden group-hover:flex absolute -top-8 ${
                              isSelf ? 'right-0' : 'left-0'
                            } bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-xl gap-1.5 z-20 transition-all`}
                          >
                            {EMOJIS.slice(0, 6).map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleToggleEmoji(msg._id, emoji)}
                                className="hover:scale-125 transition-transform p-0.5 text-xs"
                                title={`React ${emoji}`}
                              >
                                {emoji}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => setReplyToMessage(msg)}
                              className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                              title="Reply"
                            >
                              <Reply className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold p-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  <span>{selectedFriend.name} is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Replied Message Preview Banner */}
            {replyToMessage && (
              <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 min-w-0">
                  <Reply className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">Replying to {replyToMessage.sender?.name || 'User'}: </span>
                    <span className="opacity-90">{replyToMessage.content}</span>
                  </div>
                </div>
                <button onClick={() => setReplyToMessage(null)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Bottom Message Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 relative">
              {/* Emoji Picker Popup */}
              {showEmojiPicker && (
                <div className="absolute bottom-16 left-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-2xl shadow-2xl grid grid-cols-5 gap-2 z-30">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setNewMessage((prev) => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-lg transition-transform hover:scale-125"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Add Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>

              <input
                type="text"
                placeholder={`Message ${selectedFriend.name}...`}
                value={newMessage}
                onChange={handleInputChange}
                className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />

              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center flex-col text-slate-400 dark:text-slate-500 gap-3">
            <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700" />
            <p className="text-xs font-bold">Select a contact from the left list to start instant messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
};
