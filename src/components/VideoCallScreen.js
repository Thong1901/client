import React, { useContext, useEffect, useRef } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { RTCView, mediaDevices } from 'react-native-webrtc';
import { SocketContext } from '../context/SocketContext';

const VideoCallScreen = () => {
    const { incomingCall, startCall, answerCall, sendIceCandidate } = useContext(SocketContext);
    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);

    useEffect(() => {
        const getMediaStream = async () => {
            const stream = await mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current.srcObject = stream;
        };

        getMediaStream();
    }, []);

    const handleStartCall = () => {
        // Implement start call logic
    };

    const handleAnswerCall = () => {
        // Implement answer call logic
    };

    return (
        <View style={styles.container}>
            <RTCView streamURL={localStreamRef.current?.toURL()} style={styles.video} />
            <RTCView streamURL={remoteStreamRef.current?.toURL()} style={styles.video} />
            <Button title="Start Call" onPress={handleStartCall} />
            <Button title="Answer Call" onPress={handleAnswerCall} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    video: {
        width: '100%',
        height: 200,
        marginBottom: 10,
    },
});

export default VideoCallScreen;
