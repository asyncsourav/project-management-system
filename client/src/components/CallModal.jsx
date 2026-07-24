import React, { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Maximize2, Minimize2 } from 'lucide-react';
import { useCallStore } from '../store/useCallStore';

export const CallModal = ({ socket, currentUser }) => {
  const {
    callState,
    incomingCall,
    activeCall,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  } = useCallStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [callDuration, setCallDuration] = useState(0);

  const partner = activeCall?.partner || incomingCall?.caller;
  const isVideoCall = (activeCall?.callType || incomingCall?.callType) === 'one_to_one_video';

  // Synchronize localStream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Synchronize remoteStream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Call timer when connected
  useEffect(() => {
    let timer;
    if (callState === 'connected') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (callState === 'idle' || !partner) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md overflow-hidden p-4 sm:p-6 flex flex-col justify-between text-white selection:bg-indigo-600 selection:text-white">
      {/* Top Header Bar */}
      <div className="flex justify-between items-center text-white pb-3 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-extrabold text-base text-white shadow-lg border border-indigo-400/30">
            {partner?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              {partner?.name}
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
                {isVideoCall ? 'Video Call' : 'Voice Call'}
              </span>
            </h2>
            <p className="text-xs font-semibold capitalize flex items-center gap-2 mt-0.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  callState === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400 animate-ping'
                }`}
              />
              <span className={callState === 'connected' ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {callState === 'outgoing'
                  ? 'Ringing...'
                  : callState === 'incoming'
                  ? 'Incoming Call...'
                  : `Call Connected (${formatTimer(callDuration)})`}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Stream Area */}
      <div className="flex-1 my-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center min-h-0">
        {/* LOCAL STREAM CARD */}
        <div className="relative w-full aspect-video md:aspect-auto md:h-full min-h-[260px] bg-slate-900/90 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`}
          />
          {isVideoOff && (
            <div className="flex flex-col items-center gap-3 text-slate-400 p-4">
              <div className="w-20 h-20 rounded-3xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-2xl font-black text-indigo-300 shadow-inner">
                {currentUser?.name?.charAt(0)?.toUpperCase() || 'Y'}
              </div>
              <span className="text-xs font-bold text-slate-300">You ({currentUser?.name}) &bull; Camera Off</span>
            </div>
          )}
          <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-800 shadow-md flex items-center gap-2">
            <span>You</span>
            {isMuted && <MicOff className="w-3.5 h-3.5 text-rose-400" />}
          </div>
        </div>

        {/* REMOTE STREAM CARD */}
        <div className="relative w-full aspect-video md:aspect-auto md:h-full min-h-[260px] bg-slate-900/90 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${callState === 'connected' ? 'block' : 'hidden'}`}
          />
          {callState !== 'connected' && (
            <div className="flex flex-col items-center gap-3 text-slate-400 p-4 animate-pulse">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-900/40 to-slate-800 border border-indigo-500/30 flex items-center justify-center text-3xl font-black text-indigo-400 shadow-xl">
                {partner?.name?.charAt(0)?.toUpperCase() || 'P'}
              </div>
              <span className="text-xs font-bold text-slate-300">
                {callState === 'outgoing' ? 'Waiting for response...' : 'Incoming Call...'}
              </span>
            </div>
          )}
          <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-800 shadow-md">
            {partner?.name}
          </div>
        </div>
      </div>

      {/* Floating Call Action Controls */}
      <div className="sticky bottom-2 z-20 bg-slate-900/90 backdrop-blur-xl p-3 sm:p-4 rounded-3xl border border-slate-800/80 shadow-2xl flex justify-center items-center gap-4 max-w-md mx-auto w-full shrink-0">
        {callState === 'incoming' ? (
          <>
            <button
              onClick={() => acceptCall(socket)}
              className="w-14 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all shadow-lg shadow-emerald-950/50 active:scale-95 group"
              title="Accept Call"
            >
              <Phone className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={() => rejectCall(socket)}
              className="w-14 h-14 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition-all shadow-lg shadow-rose-950/50 active:scale-95 group"
              title="Decline Call"
            >
              <PhoneOff className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                isMuted
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                isVideoOff
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>

            <button
              onClick={() => endCall(socket, true)}
              className="w-14 h-14 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition-all shadow-lg shadow-rose-950/50 active:scale-95 group"
              title="End Call"
            >
              <PhoneOff className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
