import { asyncHandler } from '../middlewares/asyncHandler.js';
import ErrorHandler from '../middlewares/error.js';
import { Message } from '../models/message.js';
import { User } from '../models/user.js';
import { Connection } from '../models/connection.js';
import { CallHistory } from '../models/callHistory.js';

// * 1. Get Connected Friends (Active accepted connections + academic supervision links)
export const getConnectedFriends = asyncHandler(async (req, res, next) => {
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId).lean();
    if (!currentUser) {
        return next(new ErrorHandler('User profile not found', 404));
    }

    const connectedUserIdsSet = new Set();

    // A) Accepted peer connections
    const connections = await Connection.find({
        status: 'accepted',
        $or: [{ requester: currentUserId }, { recipient: currentUserId }],
    }).lean();

    connections.forEach((conn) => {
        if (conn && conn.requester && conn.recipient) {
            const otherId = conn.requester.toString() === currentUserId.toString()
                ? conn.recipient.toString()
                : conn.requester.toString();
            connectedUserIdsSet.add(otherId);
        }
    });

    // B) Academic Supervision Relationships: Student <-> Supervisor
    if (currentUser.role === 'Student' && currentUser.supervisor) {
        connectedUserIdsSet.add(currentUser.supervisor.toString());
    }

    if (currentUser.role === 'Teacher' && Array.isArray(currentUser.assignedStudents)) {
        currentUser.assignedStudents.forEach((stId) => {
            if (stId) connectedUserIdsSet.add(stId.toString());
        });
    }

    const connectedUserIds = Array.from(connectedUserIdsSet);

    // Fetch friend profiles excluding password and deleted users
    const friends = await User.find({
        _id: { $in: connectedUserIds },
        isDeleted: false,
        status: { $ne: 'suspended' },
    })
        .select('name email role avatar department')
        .lean();

    // Enrich each friend profile with last message info & unread counts
    const enrichedFriends = await Promise.all(
        friends.map(async (friend) => {
            const lastMsg = await Message.findOne({
                $or: [
                    { sender: currentUserId, recipient: friend._id },
                    { sender: friend._id, recipient: currentUserId },
                ],
            })
                .sort({ createdAt: -1 })
                .lean();

            const unreadCount = await Message.countDocuments({
                sender: friend._id,
                recipient: currentUserId,
                isRead: false,
            });

            return {
                ...friend,
                lastMessage: lastMsg ? lastMsg.content || (lastMsg.mediaUrl ? 'Attachment' : '') : '',
                lastMessageDate: lastMsg ? lastMsg.createdAt : null,
                unreadCount,
            };
        })
    );

    // Sort friends by most recent conversation activity first
    enrichedFriends.sort((a, b) => {
        if (!a.lastMessageDate) return 1;
        if (!b.lastMessageDate) return -1;
        return new Date(b.lastMessageDate) - new Date(a.lastMessageDate);
    });

    res.status(200).json({
        success: true,
        message: 'Connected friends fetched successfully',
        data: { friends: enrichedFriends },
    });
});

// * 2. Send Message (HTTP Endpoint Fallback)
export const sendMessage = asyncHandler(async (req, res, next) => {
    const senderId = req.user._id;
    const { recipientId, content, replyToId, replyTo } = req.body;
    const targetReplyTo = replyToId || replyTo;

    if (!recipientId || !content) {
        return next(new ErrorHandler('Recipient ID and message content are required', 400));
    }

    const message = await Message.create({
        sender: senderId,
        recipient: recipientId,
        content: content.trim(),
        replyTo: targetReplyTo || null,
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

    res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: { message: populatedMessage },
    });
});

// * 3. Get Conversation Messages (With Pagination)
export const getConversationMessages = asyncHandler(async (req, res, next) => {
    const currentUserId = req.user._id;
    const { partnerId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find({
        $or: [
            { sender: currentUserId, recipient: partnerId },
            { sender: partnerId, recipient: currentUserId },
        ],
    })
        .populate('sender', 'name avatar role department')
        .populate('recipient', 'name avatar role department')
        .populate({
            path: 'replyTo',
            populate: { path: 'sender', select: 'name' },
        })
        .populate('reactions.user', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

    // Mark messages as read when opening room and notify sender
    const updateResult = await Message.updateMany(
        { sender: partnerId, recipient: currentUserId, isRead: false },
        { $set: { isRead: true } }
    );

    if (updateResult.modifiedCount > 0) {
        const io = req.app.get('io');
        if (io) {
            io.to(partnerId.toString()).emit('messages_read', { recipientId: currentUserId, readerId: currentUserId });
            io.to(partnerId.toString()).emit('messages_read_by_recipient', { recipientId: currentUserId, readerId: currentUserId });
        }
    }

    const totalMessages = await Message.countDocuments({
        $or: [
            { sender: currentUserId, recipient: partnerId },
            { sender: partnerId, recipient: currentUserId },
        ],
    });

    res.status(200).json({
        success: true,
        message: 'Conversation messages fetched successfully',
        data: {
            messages: messages.reverse(),
            pagination: {
                totalMessages,
                page: Number(page),
                totalPages: Math.ceil(totalMessages / Number(limit)),
                hasMore: skip + messages.length < totalMessages,
            },
        },
    });
});

// * 4. Clear Full Chat History with Partner
export const clearChat = asyncHandler(async (req, res, next) => {
    const currentUserId = req.user._id;
    const { partnerId } = req.params;

    await Message.deleteMany({
        $or: [
            { sender: currentUserId, recipient: partnerId },
            { sender: partnerId, recipient: currentUserId },
        ],
    });

    res.status(200).json({
        success: true,
        message: 'Chat history cleared successfully',
    });
});

// * 5. React to Message (Toggle Emoji Reaction)
export const reactToMessage = asyncHandler(async (req, res, next) => {
    const currentUserId = req.user._id;
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
        return next(new ErrorHandler('Emoji reaction is required', 400));
    }

    const message = await Message.findById(messageId);
    if (!message) {
        return next(new ErrorHandler('Message not found', 404));
    }

    const existingIndex = message.reactions.findIndex(
        (r) => r.user.toString() === currentUserId.toString() && r.emoji === emoji
    );

    if (existingIndex > -1) {
        message.reactions.splice(existingIndex, 1);
    } else {
        message.reactions.push({ user: currentUserId, emoji });
    }

    await message.save();

    const updatedMessage = await Message.findById(messageId)
        .populate('sender', 'name avatar role department')
        .populate('recipient', 'name avatar role department')
        .populate({
            path: 'replyTo',
            populate: { path: 'sender', select: 'name' },
        })
        .populate('reactions.user', 'name')
        .lean();

    const io = req.app.get('io');
    if (io) {
        const otherUser = message.sender.toString() === currentUserId.toString()
            ? message.recipient.toString()
            : message.sender.toString();

        const payload = {
            messageId: messageId.toString(),
            _id: messageId.toString(),
            reactions: updatedMessage.reactions,
            message: updatedMessage,
        };

        io.to(otherUser).emit('message_reaction_updated', payload);
        io.to(otherUser).emit('reaction_updated', payload);
        io.to(currentUserId.toString()).emit('message_reaction_updated', payload);
        io.to(currentUserId.toString()).emit('reaction_updated', payload);
    }

    res.status(200).json({
        success: true,
        message: 'Reaction updated successfully',
        data: { message: updatedMessage },
    });
});

// * 6. Get Call History Records
export const getCallHistory = asyncHandler(async (req, res, next) => {
    const currentUserId = req.user._id;

    const history = await CallHistory.find({
        participants: currentUserId,
    })
        .populate('host', 'name avatar role department')
        .populate('participants', 'name avatar role department')
        .sort({ createdAt: -1 })
        .lean();

    res.status(200).json({
        success: true,
        message: 'Call history fetched successfully',
        data: { history },
    });
});

// * 7. Delete Single Call History Record
export const deleteCallHistoryRecord = asyncHandler(async (req, res, next) => {
    const { historyId } = req.params;

    const record = await CallHistory.findById(historyId);
    if (!record) {
        return next(new ErrorHandler('Call history record not found', 404));
    }

    await CallHistory.findByIdAndDelete(historyId);

    res.status(200).json({
        success: true,
        message: 'Call record deleted successfully',
    });
});

// * 8. Clear All Call History
export const clearAllCallHistory = asyncHandler(async (req, res, next) => {
    const currentUserId = req.user._id;

    await CallHistory.deleteMany({
        participants: currentUserId,
    });

    res.status(200).json({
        success: true,
        message: 'All call history cleared successfully',
    });
});
