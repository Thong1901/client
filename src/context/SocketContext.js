import React, { createContext, useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [incomingCall, setIncomingCall] = useState(null);

    useEffect(() => {
        const newSocket = io('https://socket-b1x3.onrender.com');
        setSocket(newSocket);

        newSocket.on('getOnlineUsers', (users) => {
            setOnlineUsers(users);
        });

        newSocket.on('receiveOffer', ({ senderId, offer }) => {
            setIncomingCall({ senderId, offer });
        });

        return () => newSocket.disconnect();
    }, []);

    const sendMessage = (message) => {
        socket.emit('sendMessage', message);
    };

    const startCall = (recipientId, offer) => {
        socket.emit('sendOffer', { recipientId, offer });
    };

    const answerCall = (recipientId, answer) => {
        socket.emit('sendAnswer', { recipientId, answer });
    };

    const sendIceCandidate = (recipientId, candidate) => {
        socket.emit('sendIceCandidate', { recipientId, candidate });
    };

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, incomingCall, sendMessage, startCall, answerCall, sendIceCandidate }}>
            {children}
        </SocketContext.Provider>
    );
};
