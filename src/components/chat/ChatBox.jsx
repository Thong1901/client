import { useContext, useEffect, useRef, useState } from "react";
import { Stack } from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient";
import moment from "moment";
import InputEmoji from "react-input-emoji";

const ChatBox = () => {
    const { user } = useContext(AuthContext);
    const {
        currentChat,
        messages,
        isMessagesLoading,
        sendTextMessage,
        startCall,
        endCall,
        acceptCall,
        rejectCall,
        localStream,
        remoteStream,
        incomingCall,
        isCallInProgress,
        callStatus,
        toggleMic,
        toggleVideo,
        isMicOn,
        isVideoOn,
    } = useContext(ChatContext);
    const { recipientUser } = useFetchRecipientUser(currentChat, user);

    const [textMessage, setTextMessage] = useState("");
    const scroll = useRef();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    useEffect(() => {
        scroll.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (incomingCall) {
            alert(`Bạn có cuộc gọi video đến từ ${incomingCall.senderId}`);
        }
    }, [incomingCall]);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
            localStream.getAudioTracks().forEach(track => track.enabled = true);
        }
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [localStream, remoteStream]);

    useEffect(() => {
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouchDevice) {
            document.body.classList.add('touch-device');
        } else {
            document.body.classList.remove('touch-device');
        }
    }, []);

    if (!recipientUser)
        return (
            <p style={{ textAlign: "center", width: "100%" }}>
                No conversation selected yet...
            </p>
        );

    if (isMessagesLoading)
        return (
            <p style={{ textAlign: "center", width: "100%" }}>
                LoadingChat...
            </p>
        );

    if (isCallInProgress) {
        return (
            <div className="video-call-container" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: '#000',
                zIndex: 1000
            }}>
                {callStatus && <p style={{ color: 'white' }}>{callStatus}</p>}

                {localStream && (
                    <div className="video-wrapper local-video-wrapper" style={{
                        position: 'absolute',
                        right: window.innerWidth < 768 ? '10px' : '20px',
                        bottom: window.innerWidth < 768 ? '80px' : '20px',
                        width: window.innerWidth < 768 ? '100px' : '200px',
                        height: window.innerWidth < 768 ? '75px' : '150px',
                        zIndex: 2
                    }}>
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                )}

                {remoteStream && (
                    <div className="video-wrapper remote-video-wrapper" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                    }}>
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                )}

                <div className="call-controls" style={{
                    position: 'absolute',
                    bottom: window.innerWidth < 768 ? '10px' : '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: window.innerWidth < 768 ? '5px' : '10px'
                }}>
                    <button
                        onClick={toggleMic}
                        style={{
                            backgroundColor: isMicOn ? '#4CAF50' : '#f44336',
                            color: 'white',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            width: '40px',
                            height: '40px'
                        }}
                    >
                        {isMicOn ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z" />
                                <path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0v5z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M13 8c0 .564-.094 1.107-.266 1.613l-.814-.814A4.02 4.02 0 0 0 12 8V7a.5.5 0 0 1 1 0v1zm-5 4c.818 0 1.578-.245 2.212-.667l.718.719a4.973 4.973 0 0 1-2.43.923V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 1 0v1a4 4 0 0 0 4 4zm3-9v4.879L5.158 2.037A3.001 3.001 0 0 1 11 3z" />
                                <path d="M9.486 10.607 5 6.12V8a3 3 0 0 0 4.486 2.607zm-7.84-9.253 12 12 .708-.708-12-12-.708.708z" />
                            </svg>
                        )}
                    </button>

                    <button
                        onClick={toggleVideo}
                        style={{
                            backgroundColor: isVideoOn ? '#4CAF50' : '#f44336',
                            color: 'white',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            width: '40px',
                            height: '40px'
                        }}
                    >
                        {isVideoOn ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M10.961 12.365a1.99 1.99 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l6.69 9.365zm-10.114-9A2.001 2.001 0 0 0 0 5v6a2 2 0 0 0 2 2h5.728L.847 3.366zm9.746 11.925-10-14 .814-.58 10 14-.814.58z" />
                            </svg>
                        )}
                    </button>

                    <button
                        className="end-call-btn"
                        onClick={endCall}
                        style={{
                            backgroundColor: 'red',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Kết thúc cuộc gọi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <Stack gap={4} className="chat-box" style={{
            height: '100%',
            maxHeight: '100vh',
            padding: window.innerWidth < 768 ? '10px' : '20px'
        }}>
            <div className="chat-header" style={{
                padding: window.innerWidth < 768 ? '5px' : '10px',
                fontSize: window.innerWidth < 768 ? '14px' : '16px'
            }}>
                <div className="d-flex align-items-center">
                    <img
                        src={recipientUser?.profilePicture || avarter}
                        alt="profile"
                        className="rounded-circle me-2"
                        style={{ width: '38px', height: '38px' }}
                    />
                    <div>
                        <strong>{recipientUser?.name}</strong>
                        {isOnline && <div className="text-muted small">Active now</div>}
                    </div>
                </div>
                <div className="d-flex align-items-center">
                    <button className="video-call-btn me-2" onClick={() => startCall(recipientUser._id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-camera-video" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2z" />
                        </svg>
                    </button>
                </div>
            </div>
            <Stack gap={3} className="messages" style={{
                maxHeight: window.innerWidth < 768 ? 'calc(100vh - 160px)' : 'calc(100vh - 200px)',
                overflowY: 'auto'
            }}>
                {messages &&
                    messages.map((message, index) => (
                        <Stack key={index}
                            className={`${message?.senderId === user?._id
                                ? "message self align-self-end flex-grow-0"
                                : "message align-self-start flex-grow-0"} `}
                            ref={scroll}
                        >
                            <span>{message.text}</span>
                            <span className="message-footer">
                                {moment(message.createdAt).calendar()}
                            </span>
                        </Stack>
                    ))
                }
            </Stack>
            <Stack
                direction="horizontal"
                gap={2}
                className="chat-input flex-grow-0"
                style={{
                    padding: window.innerWidth < 768 ? '5px' : '10px'
                }}
            >
                <InputEmoji
                    value={textMessage}
                    onChange={setTextMessage}
                    fontFamily="nunito"
                    borderColor="rgba(72, 112, 222, 0.2"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendTextMessage(textMessage, user, currentChat._id, setTextMessage);
                        } else if (e.key === 'Enter' && e.shiftKey)
                            setTextMessage((prev) => prev + "\n");
                    }}
                />
                <button className="send-btn" onClick={() =>
                    sendTextMessage(textMessage, user, currentChat._id, setTextMessage)}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-send-fill"
                        viewBox="0 0 16 16">
                        <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471z" />
                    </svg>
                </button>
            </Stack>
        </Stack>
    );
};

export default ChatBox;
