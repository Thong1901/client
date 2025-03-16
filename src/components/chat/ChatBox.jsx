import { useContext, useEffect, useRef, useState } from "react";
import { Stack } from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { useFetchRecipientUser } from "../../hooks/useFetchRecipient"; // Fixed typo
import moment from "moment";
import InputEmoji from "react-input-emoji";
import VideoCall from "../chat/CallVideo";

const ChatBox = () => {
    const { user } = useContext(AuthContext);
    const { currentChat, messages, isMessagesLoading, sendTextMessage, startCall, isCallInProgress, incomingCall, acceptCall, rejectCall } = useContext(ChatContext);
    const { recipientUser } = useFetchRecipientUser(currentChat, user); // Fixed typo

    const [textMessage, setTextMessage] = useState("");
    const scroll = useRef(); // Added scroll ref initialization

    useEffect(() => {
        scroll.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages])
    useEffect(() => {
        if (incomingCall) {
            alert(`Bạn có cuộc gọi video đến từ ${incomingCall.senderId}`);
        }
    }, [incomingCall]);
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
        return <VideoCall />; // Hiển thị giao diện gọi video
    }
    return (
        <Stack gap={4} className="chat-box">
            <div className="chat-header">
                <strong>{recipientUser?.name}</strong>
                <button
                    className="video-call-btn"
                    onClick={() => startCall(recipientUser._id)}  // Start video call with recipient user
                >
                    {incomingCall && !isCallInProgress && (
                        <div className="call-notification">
                            <p>Cuộc gọi video đến từ {incomingCall.senderId}</p>
                            <button onClick={acceptCall}>Chấp nhận</button>
                            <button onClick={rejectCall}>Từ chối</button>
                        </div>
                    )}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-camera-video"
                        viewBox="0 0 16 16"
                    >
                        <path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z" />
                    </svg>

                </button>

            </div>
            <Stack gap={3} className="messages">
                {messages &&
                    messages.map((message, index) => (
                        <Stack key={index}
                            className={`${message?.senderId === user?._id
                                ? "message self align-self-end flex-grow-0"
                                : "message align-self-start flex-grow-0"} `}
                            ref={scroll} // Added scroll ref
                        >
                            <span>{message.text}</span>
                            <span className="message-footer">
                                {moment(message.createdAt).calendar()}
                            </span>
                        </Stack>
                    ))
                }
            </Stack>
            <Stack direction="horizontal" gap={3} className="chat-input flex-grow-0">
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
