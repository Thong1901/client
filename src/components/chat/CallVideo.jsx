import React, { useContext, useEffect, useRef, useState } from "react";
import { ChatContext } from "../../context/ChatContext";

// Hàm xác nhận cuộc gọi
const handleCallResponse = () => {
    return new Promise((resolve) => {
        const acceptCall = window.confirm("Bạn có muốn chấp nhận cuộc gọi không?");
        if (acceptCall) {
            resolve("accept");
        } else {
            resolve("reject");
        }
    });
};

const VideoCall = () => {
    const { localStream, remoteStream, endCall, acceptCall, rejectCall, incomingCall, outgoingCall, callStatus } = useContext(ChatContext);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    useEffect(() => {
        // Gắn stream local vào video local
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
            localStream.getAudioTracks().forEach(track => track.enabled = true); // Ensure audio is enabled
        }
        // Gắn stream remote vào video remote
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [localStream, remoteStream]);

    // Hàm xử lý cuộc gọi
    const handleAcceptCall = async () => {
        if (!incomingCall) {
            console.error("No incoming call data");
            return;
        }
        const response = await handleCallResponse();
        if (response === "accept") {
            acceptCall(incomingCall.senderId, incomingCall.offer);
        } else {
            rejectCall(incomingCall.senderId);
        }
    };

    const handleEndCall = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop());
        }
        endCall();
    };

    return (
        <div className="video-call-container">
            {/* Thông báo trạng thái cuộc gọi */}
            {callStatus && <p>{callStatus}</p>}
            {/* Video của chính người dùng */}
            {localStream && (
                <div className="video-wrapper local-video-wrapper">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        className="local-video"
                    />
                    <p>Bạn</p>
                </div>
            )}
            {/* Video của người đối diện */}
            {remoteStream && (
                <div className="video-wrapper remote-video-wrapper">
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        className="remote-video"
                    />
                    <p>Người đối diện</p>
                </div>
            )}
            {incomingCall && !localStream && !remoteStream && (
                <div className="call-controls">
                    <button className="accept-call-btn" onClick={handleAcceptCall}>
                        Chấp nhận
                    </button>
                    <button className="reject-call-btn" onClick={() => rejectCall(incomingCall.senderId)}>
                        Từ chối
                    </button>
                </div>
            )}
            {/* Nút kết thúc cuộc gọi */}
            {(localStream || remoteStream) && (
                <button className="end-call-btn" onClick={handleEndCall}>
                    Kết thúc cuộc gọi
                </button>
            )}
        </div>
    );
};

export default VideoCall;
