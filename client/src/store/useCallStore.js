import { create } from 'zustand';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export const useCallStore = create((set, get) => {
  // Module internal refs for WebRTC non-serializable objects
  let peerConnection = null;
  let iceCandidatesQueue = [];

  const cleanupWebRTC = () => {
    const { localStream, remoteStream } = get();

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        try {
          track.enabled = false;
          track.stop();
        } catch (e) {
          console.error('Error stopping local track:', e);
        }
      });
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => {
        try {
          track.enabled = false;
          track.stop();
        } catch (e) {
          console.error('Error stopping remote track:', e);
        }
      });
    }

    if (peerConnection) {
      try {
        peerConnection.ontrack = null;
        peerConnection.onicecandidate = null;
        peerConnection.onconnectionstatechange = null;
        peerConnection.close();
      } catch (e) {
        console.error('Error closing RTCPeerConnection:', e);
      }
      peerConnection = null;
    }

    iceCandidatesQueue = [];

    set({
      callState: 'idle',
      incomingCall: null,
      activeCall: null,
      localStream: null,
      remoteStream: null,
      isMuted: false,
      isVideoOff: false,
    });
  };

  const flushIceCandidates = async () => {
    if (!peerConnection || !peerConnection.remoteDescription) return;
    while (iceCandidatesQueue.length > 0) {
      const candidate = iceCandidatesQueue.shift();
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error flushing buffered ICE candidate:', err);
      }
    }
  };

  const getUserMediaStream = async (isVideoCall) => {
    const constraints = isVideoCall ? { audio: true, video: true } : { audio: true };
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      console.warn('Primary media constraints failed, trying audio-only fallback:', err);
      try {
        return await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (audioErr) {
        console.error('Failed to access media devices:', audioErr);
        throw audioErr;
      }
    }
  };

  return {
    // State Slices
    callState: 'idle', // 'idle' | 'outgoing' | 'incoming' | 'connected'
    incomingCall: null, // { caller, callType, offer }
    activeCall: null, // { partner, callType, isCaller }
    localStream: null,
    remoteStream: null,
    isMuted: false,
    isVideoOff: false,

    // Actions & WebRTC Methods
    setIncomingCall: (incomingData) => {
      const { callState } = get();
      if (callState !== 'idle' && callState !== 'incoming') {
        console.warn('User busy, ignoring incoming call');
        return;
      }
      set({
        incomingCall: incomingData,
        callState: 'incoming',
      });
    },

    initiateCall: async (partner, callType, socket) => {
      if (!partner?._id || !socket) return;

      cleanupWebRTC();

      const isVideoCall = callType === 'one_to_one_video';

      set({
        callState: 'outgoing',
        activeCall: { partner, callType, isCaller: true },
        isVideoOff: !isVideoCall,
      });

      try {
        const stream = await getUserMediaStream(isVideoCall);
        const remoteStreamObj = new MediaStream();

        set({ localStream: stream, remoteStream: remoteStreamObj });

        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnection = pc;

        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            set({ remoteStream: event.streams[0] });
          } else if (event.track) {
            remoteStreamObj.addTrack(event.track);
            set({ remoteStream: new MediaStream(remoteStreamObj.getTracks()) });
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate && socket) {
            socket.emit('ice_candidate', {
              targetId: partner._id,
              candidate: event.candidate,
            });
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
            console.warn('WebRTC connection state:', pc.connectionState);
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit('initiate_call', {
          recipientId: partner._id,
          callType,
          offer,
        });
      } catch (err) {
        console.error('Failed to initiate call:', err);
        cleanupWebRTC();
      }
    },

    acceptCall: async (socket) => {
      const { incomingCall } = get();
      if (!incomingCall || !socket) return;

      const partner = incomingCall.caller;
      const callType = incomingCall.callType;
      const offer = incomingCall.offer;
      const isVideoCall = callType === 'one_to_one_video';

      set({
        incomingCall: null,
        activeCall: { partner, callType, isCaller: false },
        callState: 'connected',
        isVideoOff: !isVideoCall,
      });

      try {
        const stream = await getUserMediaStream(isVideoCall);
        const remoteStreamObj = new MediaStream();

        set({ localStream: stream, remoteStream: remoteStreamObj });

        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnection = pc;

        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        pc.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            set({ remoteStream: event.streams[0] });
          } else if (event.track) {
            remoteStreamObj.addTrack(event.track);
            set({ remoteStream: new MediaStream(remoteStreamObj.getTracks()) });
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate && socket && partner?._id) {
            socket.emit('ice_candidate', {
              targetId: partner._id,
              candidate: event.candidate,
            });
          }
        };

        if (offer) {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          await flushIceCandidates();
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('answer_call', {
          callerId: partner._id,
          answer,
          callType,
        });
      } catch (err) {
        console.error('Failed to accept call:', err);
        cleanupWebRTC();
      }
    },

    handleCallAccepted: async ({ answer }) => {
      if (!peerConnection || !answer) return;

      try {
        if (peerConnection.signalingState !== 'stable') {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
          await flushIceCandidates();
        }
        set({ callState: 'connected' });
      } catch (err) {
        console.error('Error applying remote answer on call_accepted:', err);
      }
    },

    handleIceCandidate: async ({ candidate }) => {
      if (!candidate) return;

      if (peerConnection && peerConnection.remoteDescription) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error('Error adding ICE candidate:', err);
        }
      } else {
        iceCandidatesQueue.push(candidate);
      }
    },

    rejectCall: (socket) => {
      const { incomingCall, activeCall } = get();
      const targetId = incomingCall?.caller?._id || activeCall?.partner?._id;

      if (socket && targetId) {
        socket.emit('reject_call', { callerId: targetId });
      }

      cleanupWebRTC();
    },

    endCall: (socket, emitSocket = true) => {
      const { activeCall, incomingCall } = get();
      const targetId = activeCall?.partner?._id || incomingCall?.caller?._id;

      if (emitSocket && socket && targetId) {
        socket.emit('end_call', { targetId });
      }

      cleanupWebRTC();
    },

    toggleMute: () => {
      const { localStream, isMuted } = get();
      if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = isMuted; // Toggle: if muted, enable track (so isMuted becomes false)
          set({ isMuted: !isMuted });
        }
      }
    },

    toggleVideo: () => {
      const { localStream, isVideoOff } = get();
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = isVideoOff; // Toggle: if video off, enable track (so isVideoOff becomes false)
          set({ isVideoOff: !isVideoOff });
        }
      }
    },

    resetCallStore: () => {
      cleanupWebRTC();
    },
  };
});
