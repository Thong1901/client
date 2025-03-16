import { createContext, useState, useEffect, useCallback, useRef } from "react";
import { baseUrl, getRequest, postRequest } from "../utils/services";
import { io } from "socket.io-client";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children, user }) => {
    const [userChats, setUserChats] = useState(null);
    const [isUserChatsLoading, setIsUserChatsLoading] = useState(false);
    const [userChatsError, setUserChatsError] = useState(null);
    const [potentialChats, setPotentialChats] = useState([]);

    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState(null);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [messagesError, setMessagesError] = useState(null);

    const [sendTextMessageError, setSendTextMessageError] = useState(null);
    const [newMessage, setNewMessage] = useState(null);

    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    const [notifications, setNotifications] = useState([]);

    const [allUsers, setAllUsers] = useState([]);

    const [callStatus, setCallStatus] = useState("");

    //tạo cuộc gọi 
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [incomingCall, setIncomingCall] = useState(null);
    const [peerConnection, setPeerConnection] = useState(null);
    const [isCallInProgress, setIsCallInProgress] = useState(false);
    const [isCallAccepted, setIsCallAccepted] = useState(false);
    const [isCallRejected, setIsCallRejected] = useState(false);
    const videoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const getMediaStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
        } catch (err) {
            console.error("Error accessing media devices.", err);
        }
    };

    useEffect(() => {
        if (videoRef.current && localStream) {
            videoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const [iceCandidatesQueue, setIceCandidatesQueue] = useState([]);

    const startCall = useCallback(async (recipientId) => {
        if (!socket) return;
        setCallStatus("Đang gọi...");

        try {
            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                    { urls: "stun:stun1.l.google.com:19302" },
                    {
                        urls: 'turn:numb.viagenie.ca',
                        username: 'webrtc@live.com',
                        credential: 'muazkh'
                    }
                ],
            });

            // Handle ICE candidate queue
            if (iceCandidatesQueue.length > 0) {
                console.log("Processing ICE candidate queue");
                iceCandidatesQueue.forEach(async (candidate) => {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                });
                setIceCandidatesQueue([]);
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 },
                audio: true
            });

            setLocalStream(stream);
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("sendIceCandidate", {
                        recipientId,
                        candidate: event.candidate,
                        senderId: user._id
                    });
                }
            };

            pc.oniceconnectionstatechange = () => {
                console.log("ICE State:", pc.iceConnectionState);
            };

            pc.ontrack = (event) => {
                if (event.streams && event.streams[0]) {
                    console.log("Remote stream received");
                    setRemoteStream(event.streams[0]);
                }
            };

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit("sendOffer", {
                recipientId,
                offer: pc.localDescription,
                senderId: user._id
            });

            setPeerConnection(pc);
            setIsCallInProgress(true);

        } catch (err) {
            console.error("Error in startCall:", err);
            endCall();
        }
    }, [socket, user, iceCandidatesQueue]);

    useEffect(() => {
        if (!socket) return;

        socket.on("receiveIceCandidate", async ({ candidate }) => {
            console.log("Received ICE candidate");
            if (peerConnection?.remoteDescription) {
                try {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                    console.log("ICE candidate added successfully");
                } catch (err) {
                    console.error("Error adding ICE candidate:", err);
                    // Queue the candidate if we can't add it yet
                    setIceCandidatesQueue(queue => [...queue, candidate]);
                }
            } else {
                // Queue the candidate if we don't have a remote description yet
                setIceCandidatesQueue(queue => [...queue, candidate]);
            }
        });

        // ...existing socket listeners...
    }, [socket, peerConnection]);

    const answerCall = useCallback(async (senderId, offer) => {
        if (!socket) return; // Ensure socket is initialized
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
            ],
        });

        setPeerConnection(pc);

        // Xử lý stream local
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        // Nhận remote stream
        pc.ontrack = (event) => {
            setRemoteStream(event.streams[0]); // Ensure remote stream is set correctly
        };

        // Gửi ICE Candidate qua socket
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("sendIceCandidate", {
                    recipientId: senderId,
                    candidate: event.candidate,
                });
            }
        };

        // Thiết lập Offer và gửi Answer
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("sendAnswer", { recipientId: senderId, answer });
        setIsCallInProgress(true);
    }, [socket]);

    const acceptCall = useCallback(async () => {
        if (!socket || !incomingCall) return;

        try {
            const { senderId, offer } = incomingCall;
            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                    { urls: "stun:stun1.l.google.com:19302" },
                    { urls: 'turn:numb.viagenie.ca', credential: 'muazkh', username: 'webrtc@live.com' }
                ],
            });

            // Get local stream first
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            setLocalStream(stream);

            // Add all tracks from local stream to peer connection
            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            });

            // Handle remote stream
            pc.ontrack = (event) => {
                console.log("Got remote track:", event.streams[0]);
                setRemoteStream(event.streams[0]);
            };

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    console.log("Sending ICE candidate");
                    socket.emit("sendIceCandidate", {
                        recipientId: senderId,
                        candidate: event.candidate,
                        senderId: user._id
                    });
                }
            };

            pc.oniceconnectionstatechange = () => {
                console.log("ICE connection state:", pc.iceConnectionState);
            };

            // Set remote description first
            await pc.setRemoteDescription(new RTCSessionDescription(offer));

            // Create and send answer
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(new RTCSessionDescription(answer));

            socket.emit("sendAnswer", {
                recipientId: senderId,
                answer,
                senderId: user._id
            });

            setPeerConnection(pc);
            setIsCallInProgress(true);
            setIsCallAccepted(true);
            setIncomingCall(null);

        } catch (err) {
            console.error("Error accepting call:", err);
            endCall();
        }
    }, [incomingCall, socket, user]);

    const rejectCall = useCallback(() => {
        if (!socket || !incomingCall) return; // Ensure socket is initialized and incomingCall exists
        if (socket && incomingCall) {
            const { senderId } = incomingCall;
            socket.emit("callRejected", { recipientId: senderId });
        }

        setIsCallInProgress(false);
        setIsCallAccepted(false);
        setIsCallRejected(true);
        setIncomingCall(null);
    }, [socket, incomingCall]);

    const endCall = useCallback(() => {
        if (peerConnection) {
            peerConnection.close();
            setPeerConnection(null);
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop()); // Stop local stream tracks
            setLocalStream(null);
        }
        if (remoteStream) {
            remoteStream.getTracks().forEach(track => track.stop()); // Stop remote stream tracks
            setRemoteStream(null);
        }
        setIsCallInProgress(false);
        setIsCallAccepted(false);
        setIsCallRejected(false);
        setCallStatus("");
    }, [peerConnection, localStream, remoteStream]);

    useEffect(() => {
        if (!socket) return;

        socket.on("receiveOffer", async ({ senderId, offer }) => {
            setIncomingCall({ senderId, offer });

            const response = await handleCallResponse(); // Trả về "accept" hoặc "reject"

            if (response === "accept") {
                answerCall(senderId, offer);
                setIsCallAccepted(true);
                setCallStatus("");
            } else {
                socket.emit("callRejected", { recipientId: senderId });
                setIsCallRejected(true);
                endCall();
            }
        });

        socket.on("callRejected", () => {
            alert("Cuộc gọi đã bị từ chối.");
            endCall();
        });

        return () => {
            socket.off("receiveOffer");
            socket.off("callRejected");
        };
    }, [socket, answerCall, endCall]);

    // Xử lý phản hồi gọi
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

    //inittal  socket
    useEffect(() => {
        const newSocket = io("https://socket-b1x3.onrender.com");
        setSocket(newSocket);
        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    //add online users
    useEffect(() => {
        if (socket === null) return;
        socket.emit("addNewUser", user?._id);
        socket.on("getOnlineUsers", (res) => {
            setOnlineUsers(res);
        });
        return () => {
            socket.off("getOnlineUsers");
        };
    }, [socket])
    // send message
    useEffect(() => {
        if (socket === null) return;

        const recipientId = currentChat?.members?.find((id) => id !== user?._id);

        socket.emit("sendMessage", { ...newMessage, recipientId })

    }, [newMessage]);

    //receive message and notification
    useEffect(() => {
        if (socket === null) return;
        socket.on("getMessage", res => {
            if (currentChat?._id !== res.chatId) return;

            setMessages((prev) => [...prev, res]);
        });

        socket.on("getNotification", res => {
            const isChatOpen = currentChat?.members.some(id => id === res.senderId);
            if (isChatOpen) {
                setNotifications((prev) => [{ ...res, isRead: true }, ...prev])
            } else {
                setNotifications(prev => [res, ...prev]);
            }
        })
        socket.on("receiveOffer", async ({ senderId, offer }) => {
            answerCall(senderId, offer);
        });

        socket.on("receiveAnswer", async ({ answer }) => {
            console.log("Received answer");
            if (peerConnection) {
                try {
                    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
                } catch (err) {
                    console.error("Error setting remote description:", err);
                }
            }
        });

        socket.on("receiveIceCandidate", async ({ candidate }) => {
            console.log("Received ICE candidate");
            if (peerConnection && peerConnection.remoteDescription) {
                try {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                    console.log("Added ICE candidate successfully");
                } catch (err) {
                    console.error("Error adding ICE candidate:", err);
                }
            } else {
                console.log("Waiting for remote description before adding ICE candidate");
            }
        });

        return () => {
            socket.off("getMessage");
            socket.off("getNotification");
            socket.off("receiveOffer");
            socket.off("receiveAnswer");
            socket.off("receiveIceCandidate");
        }

    }, [socket, currentChat, answerCall, peerConnection]);

    //getUsers
    useEffect(() => {

        const getUsers = async () => {

            const response = await getRequest(`${baseUrl}/users`);

            if (response.error) {
                return console.log("Error fetching users ", response)
            }

            const pChats = response.filter((u) => {
                let isChatCreated = false;

                if (user?._id === u._id) return false;
                if (userChats) {
                    isChatCreated = userChats?.some((chat) => {
                        return chat.members[1] === u._id || chat.members[0] === u._id;

                    })
                }
                return !isChatCreated;
            });
            if (pChats.length > 0) { setPotentialChats(pChats); }
            setAllUsers(response);
            // setPotentialChats(pChats);
        }
        getUsers();

    }, [userChats])


    //getUserChats
    useEffect(() => {
        const getUserChats = async () => {
            if (user?._id) {

                setIsUserChatsLoading(true);
                setUserChatsError(null);

                const response = await getRequest(`${baseUrl}/chats/${user?._id}`);

                setIsUserChatsLoading(false);

                if (response.error) {
                    return setUserChatsError(response);
                }

                setUserChats(response)
            }
        };
        getUserChats();
    }, [user, notifications]);

    //getMessages
    useEffect(() => {
        const getMessages = async () => {
            setIsMessagesLoading(true);
            setMessagesError(null);

            const response = await getRequest(
                `${baseUrl}/messages/${currentChat?._id}`
            );

            setIsMessagesLoading(false);

            if (response.error) {
                return setMessagesError(response);
            }

            setMessages(response);
        };
        getMessages();
    }, [currentChat]);

    const sendTextMessage = useCallback(
        async (textMessage, sender, currentChatId, setTextMessage) => {
            if (!textMessage) return console.log("You must type something...")

            const response = await postRequest(
                `${baseUrl}/messages`,
                JSON.stringify({
                    chatId: currentChatId,
                    senderId: sender._id,
                    text: textMessage,
                }));


            if (response.error) {
                return setSendTextMessageError(response);
            }
            setNewMessage(response);
            setMessages((prev) => [...prev, response]);
            setTextMessage("");

        }, []
    );

    const updateCurrentChat = useCallback((chat) => {
        setCurrentChat(chat);
    }, []);

    const createChat = useCallback(async (firstId, secondId) => {
        const response = await postRequest(
            `${baseUrl}/chats`,
            JSON.stringify({
                firstId,
                secondId,
            })
        );
        if (response.error) {
            return console.log("Error creating chat", response);
        }
        setUserChats((prev) => [...prev, response]);

    }, []);

    const markAllNotificationAsread = useCallback((notifications) => {

        const mNofications = notifications.map((n) => {
            return { ...n, isRead: true };
        });
        setNotifications(mNofications);
    });
    const markNotificationAsRead = useCallback((n, userChats, user, notifications) => {
        //find chat to open
        const desiredChat = userChats.find((chat) => {
            const chatMembers = [user._id, n.senderId]
            const isDesiredChat = chat?.members.every((member) => {
                return chatMembers.includes(member);
            });
            return isDesiredChat
        });
        //mark notification as read
        const mNotifications = notifications.map(el => {
            if (n.senderId === el.senderId) {
                return { ...n, isRead: true }
            } else {
                return el
            }
        })
        updateCurrentChat(desiredChat);
        setNotifications(mNotifications);
    }, []);

    const markThisUserNotificationsAsRead = useCallback((thisUserNotifications, notifications) => {
        //mark notification as read
        const mNotifications = notifications.map(el => {
            let notification;
            thisUserNotifications.forEach(n => {
                if (n.senderId === el.senderId) {
                    notification = { ...n, isRead: true }
                } else {
                    notification = el
                }
            })
            return notification;
        })
        setNotifications(mNotifications);
    })

    return (
        <ChatContext.Provider
            value={{
                currentChat,
                userChats,
                isUserChatsLoading,
                userChatsError,

                potentialChats,
                createChat,
                updateCurrentChat,

                messages,
                isMessagesLoading,
                messagesError,

                sendTextMessage,
                newMessage,
                sendTextMessageError,
                onlineUsers,
                socket,
                notifications,
                allUsers,
                markAllNotificationAsread,
                markNotificationAsRead,
                markThisUserNotificationsAsRead,
                // Gọi video
                localStream,
                remoteStream,
                isCallInProgress,
                startCall,
                endCall,
                answerCall,
                isCallAccepted,
                isCallRejected,
                incomingCall,
                rejectCall,
                acceptCall,
                callStatus,
            }}
        >
            {children}
        </ChatContext.Provider >
    );

};