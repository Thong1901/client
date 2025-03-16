import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { SocketContext } from '../context/SocketContext';

const ChatScreen = () => {
    const { socket, sendMessage } = useContext(SocketContext);
    const [messages, setMessages] = useState([]);
    const [textMessage, setTextMessage] = useState('');

    useEffect(() => {
        if (!socket) return;

        socket.on('getMessage', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        return () => socket.off('getMessage');
    }, [socket]);

    const handleSendMessage = () => {
        sendMessage({ text: textMessage });
        setTextMessage('');
    };

    return (
        <View>
            <FlatList
                data={messages}
                renderItem={({ item }) => <Text>{item.text}</Text>}
                keyExtractor={(item, index) => index.toString()}
            />
            <TextInput value={textMessage} onChangeText={setTextMessage} />
            <Button title="Send" onPress={handleSendMessage} />
        </View>
    );
};

export default ChatScreen;
