import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
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
        <View style={styles.container}>
            <FlatList
                data={messages}
                renderItem={({ item }) => <Text style={styles.message}>{item.text}</Text>}
                keyExtractor={(item, index) => index.toString()}
                style={styles.messageList}
            />
            <TextInput
                value={textMessage}
                onChangeText={setTextMessage}
                style={styles.input}
                placeholder="Type a message"
            />
            <Button title="Send" onPress={handleSendMessage} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    messageList: {
        flex: 1,
    },
    message: {
        padding: 10,
        backgroundColor: '#f1f1f1',
        borderRadius: 5,
        marginVertical: 5,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        paddingHorizontal: 10,
        marginBottom: 10,
    },
});

export default ChatScreen;
