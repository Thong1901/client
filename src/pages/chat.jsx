import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import ChatBox from "../components/chat/ChatBox";
import PotentialChats from "../components/chat/PotentialChats";
import UserChat from "../components/chat/UserChat";
import { Container, Stack } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";


const Chat = () => {
    const { user } = useContext(AuthContext);
    const { userChats, isUserChatsLoading, updateCurrentChat, } = useContext(ChatContext);
    return (
        <Container fluid className="px-0">
            <div className="d-flex flex-column flex-md-row">
                <div className="chat-sidebar">
                    <PotentialChats />
                    <div className="messages-box">
                        {isUserChatsLoading && <p>Loading chats...</p>}
                        {userChats?.map((chat, index) => (
                            <div key={index} onClick={() => updateCurrentChat(chat)}>
                                <UserChat chat={chat} user={user} />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="chat-main flex-grow-1">
                    {userChats?.length < 1 ? (
                        <div className="no-chats-placeholder">
                            <p>Start a new conversation</p>
                        </div>
                    ) : (
                        <ChatBox />
                    )}
                </div>
            </div>
        </Container>
    );
}

export default Chat;