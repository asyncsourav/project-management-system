import { Message } from '../models/message.js';
import { User } from '../models/user.js';
import { Connection } from '../models/connection.js';

// Global map of online connected sockets: userId -> set of socketIds
const onlineUsersMap = new Map();

export const initializeChatSockets = (io) => {
    io.on('connection', async (socket) => {
        // Resolve user identity from socket.user OR auth/query parameters
        let userId = socket.user?._id?.toString() ||
                     socket.handshake?.auth?.userId?.toString() ||
                     socket.handshake?.query?.userId?.toString();

        if (!userId) {
            return;
        }

        // Fetch user profile if missing
        if (!socket.user) {
            try {
                const userObj = await User.findById(userId).select('name email role avatar department').lean();
                if (userObj) socket.user = userObj;
            } catch (err) {
                console.error('Error resolving socket user profile:', err);
            }
        }

        // Join personal user room for direct messaging & notifications
        socket.join(userId);

        // Track online sockets for this user
        if (!onlineUsersMap.has(userId)) {
            onlineUsersMap.set(userId, new Set());
        }
        onlineUsersMap.get(userId).add(socket.id);

        // Send current list of online users to the newly connected user
        const currentOnlineUserIds = Array.from(onlineUsersMap.keys());
        socket.emit('online_users_list', currentOnlineUserIds);

        // Notify active connections that this user is online
        socket.broadcast.emit('user_online', { userId });

        // Handler: Send Message in 1-on-1 Chat
        socket.on('send_message', async (data, callback) => {
            try {
                const { recipientId, content, mediaUrl, fileUrl, mediaType, fileName, fileSize, replyToId, replyTo } = data;
                const targetReplyTo = replyToId || replyTo;

                if (!recipientId || (!content && !mediaUrl && !fileUrl)) {
                    if (callback) callback({ success: false, error: 'Recipient and content or media required' });
                    return;
                }

                // Check block status
                const isBlocked = await Connection.findOne({
                    status: 'blocked',
                    $or: [
                        { requester: userId, recipient: recipientId },
                        { requester: recipientId, recipient: userId },
                    ],
                });

                if (isBlocked) {
                    if (callback) callback({ success: false, error: 'Cannot send message to this user' });
                    return;
                }

                const message = await Message.create({
                    sender: userId,
                    recipient: recipientId,
                    content: content || '',
                    replyTo: targetReplyTo || null,
                    mediaUrl: mediaUrl || fileUrl || '',
                    mediaType: mediaType || 'none',
                    fileName: fileName || '',
                    fileSize: fileSize || '',
                    isRead: false,
                });

                const populatedMessage = await Message.findById(message._id)
                    .populate('sender', 'name avatar role department')
                    .populate('recipient', 'name avatar role department')
                    .populate({
                        path: 'replyTo',
                        populate: { path: 'sender', select: 'name' },
                    })
                    .populate('reactions.user', 'name')
                    .lean();

                // Emit real-time message to recipient and sender
                io.to(recipientId.toString()).emit('receive_message', populatedMessage);
                io.to(userId.toString()).emit('receive_message', populatedMessage);

                if (callback) callback({ success: true, message: populatedMessage });
            } catch (err) {
                console.error('Socket send_message error:', err);
                if (callback) callback({ success: false, error: 'Failed to send message' });
            }
        });

        // Handler: Mark Messages as Read
        socket.on('mark_read', async (data) => {
            try {
                const { senderId } = data;
                if (!senderId) return;

                await Message.updateMany(
                    { sender: senderId, recipient: userId, isRead: false },
                    { $set: { isRead: true } }
                );

                // Notify original message sender that messages have been read
                io.to(senderId.toString()).emit('messages_read', { recipientId: userId, readerId: userId });
                io.to(senderId.toString()).emit('messages_read_by_recipient', { recipientId: userId, readerId: userId });
            } catch (err) {
                console.error('Socket mark_read error:', err);
            }
        });

        // Handler: Toggle Message Reaction
        socket.on('toggle_reaction', async (data) => {
            try {
                const { messageId, emoji } = data;
                const message = await Message.findById(messageId);
                if (!message) return;

                const existingIndex = message.reactions.findIndex(
                    (r) => r.user.toString() === userId && r.emoji === emoji
                );

                if (existingIndex > -1) {
                    message.reactions.splice(existingIndex, 1);
                } else {
                    message.reactions.push({ user: userId, emoji });
                }

                await message.save();

                const updated = await Message.findById(messageId)
                    .populate('sender', 'name avatar role department')
                    .populate('recipient', 'name avatar role department')
                    .populate({
                        path: 'replyTo',
                        populate: { path: 'sender', select: 'name' },
                    })
                    .populate('reactions.user', 'name')
                    .lean();

                const otherUser = message.sender.toString() === userId ? message.recipient.toString() : message.sender.toString();
                const reactionPayload = {
                    messageId: messageId.toString(),
                    _id: messageId.toString(),
                    reactions: updated.reactions,
                    message: updated,
                };

                io.to(otherUser.toString()).emit('message_reaction_updated', reactionPayload);
                io.to(otherUser.toString()).emit('reaction_updated', reactionPayload);

                io.to(userId.toString()).emit('message_reaction_updated', reactionPayload);
                io.to(userId.toString()).emit('reaction_updated', reactionPayload);
            } catch (err) {
                console.error('Socket toggle_reaction error:', err);
            }
        });

        // Handler: Typing Indicator
        socket.on('typing_start', ({ recipientId }) => {
            if (recipientId) {
                io.to(recipientId.toString()).emit('user_typing', { userId });
            }
        });

        socket.on('typing_stop', ({ recipientId }) => {
            if (recipientId) {
                io.to(recipientId.toString()).emit('user_stop_typing', { userId });
            }
        });

        // Handler: Disconnect
        socket.on('disconnect', () => {
            const userSockets = onlineUsersMap.get(userId);
            if (userSockets) {
                userSockets.delete(socket.id);
                if (userSockets.size === 0) {
                    onlineUsersMap.delete(userId);
                    socket.broadcast.emit('user_offline', { userId });
                }
            }
        });
    });
};
