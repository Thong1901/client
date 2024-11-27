import { Stack } from "react-bootstrap";
import { useFechRecipientUser } from "../../hooks/useFetchRecipient";
import avarter from "../../assets/avarter.svg";
import { useContext } from "react";
import { ChatContext } from "../../context/ChatContext";
import { unreadNotificationsFunc } from "../../utils/unreadNotifications";
import { useFechLatesMessage } from "../../hooks/useFetchLatestMessage";
import moment from "moment"
const UserChat = ({ chat, user }) => {
    const { recipientUser } = useFechRecipientUser(chat, user);
    const { onlineUsers, notifications, markThisUserNotificationsAsRead } = useContext(ChatContext);
    const { latesMessage } = useFechLatesMessage(chat)
    console.log("lates", latesMessage)
    const unreadNotifications = unreadNotificationsFunc(notifications);

    const thisUserNotifications = unreadNotifications?.filter(
        n => n.senderId == recipientUser?._id
    )
    const isOnline = onlineUsers?.some((user) => user?.userId === recipientUser?._id)

    const truncateText = (text) => {
        let shortText = text.substring(0, 20);
        if (text.length > 20) {
            shortText = shortText + "..."
        }
        return shortText;
    }
    return (
        <Stack
            direction="horizontal"
            gap={3}
            className="user-card align-items-center p-2 
            justify-content-between"
            role="button"
            onClick={() => {
                if (thisUserNotifications?.length !== 0) {
                    markThisUserNotificationsAsRead(
                        thisUserNotifications,
                        notifications
                    )
                }
            }}
        >

            <div className="d-flex">
                <div className="me-2">
                    <img src={avarter} height="35px" />
                </div>
                <div className="text-content">
                    <div className="name">{recipientUser?.name}</div>
                    <div className="text">
                        {latesMessage?.text && (
                            <span>{truncateText(latesMessage?.text)}</span>
                        )}
                    </div>
                </div>
            </div>
            <div className="d-flex flex-column align-items-end">
                <div className="date">{moment(latesMessage?.createAt).calendar()}</div>
                <div
                    className={thisUserNotifications?.length > 0 ? "this-user-notifications" : ""}>
                    {thisUserNotifications?.length > 0 ? thisUserNotifications?.length : ""}
                </div>
                <span className={
                    isOnline ?
                        "user-online"
                        : " "
                }></span>
            </div>
        </Stack >
    );
    return (<>UserChat</>);
};

export default UserChat;