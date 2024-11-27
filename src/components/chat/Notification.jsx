import { useContext, useState } from "react";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { unreadNotificationsFunc } from "../../utils/unreadNotifications";
import moment from "moment";


const Notification = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useContext(AuthContext);
    const { notifications, userChats, allUsers, markAllNotificationAdRead, markNotificationAsRead } = useContext(ChatContext);

    const unreadNotifications = unreadNotificationsFunc(notifications);

    const modifiedNotifications = notifications.map((n) => {
        const sender = allUsers.find(user => user._id === n.senderId);

        return {
            ...n,
            senderName: sender?.name,
        }
    });
    console.log("un", unreadNotifications);
    console.log("mo", modifiedNotifications);

    return (
        <div className="notifications">
            <div className="notifications-icon" onClick={() => setIsOpen(!isOpen)}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    className="bi bi-chat-left-fill"
                    viewBox="0 0 16 16">
                    <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4.414a1 1 0 0 0-.707.293L.854 15.146A.5.5 0 0 1 0 14.793zm7.194 2.766a1.7 1.7 0 0 0-.227-.272 1.5 1.5 0 0 0-.469-.324l-.008-.004A1.8 1.8 0 0 0 5.734 4C4.776 4 4 4.746 4 5.667c0 .92.776 1.666 1.734 1.666.343 0 .662-.095.931-.26-.137.389-.39.804-.81 1.22a.405.405 0 0 0 .011.59c.173.16.447.155.614-.01 1.334-1.329 1.37-2.758.941-3.706a2.5 2.5 0 0 0-.227-.4zM11 7.073c-.136.389-.39.804-.81 1.22a.405.405 0 0 0 .012.59c.172.16.446.155.613-.01 1.334-1.329 1.37-2.758.942-3.706a2.5 2.5 0 0 0-.228-.4 1.7 1.7 0 0 0-.227-.273 1.5 1.5 0 0 0-.469-.324l-.008-.004A1.8 1.8 0 0 0 10.07 4c-.957 0-1.734.746-1.734 1.667 0 .92.777 1.666 1.734 1.666.343 0 .662-.095.931-.26z" />
                </svg>
                {unreadNotifications?.length === 0 ? null : (
                    <span className="notification-count">
                        <span>{unreadNotifications?.length}</span>
                    </span>
                )}
            </div>
            {isOpen ?
                (<div className="notifications-box">
                    <div className="notifications-header">
                        <h3>Notifications</h3>
                        <div className="mark-as-read" onClick={() => markAllNotificationAsread(notifications)}
                        > Mark all as read</div>
                    </div>
                    {modifiedNotifications?.length === 0 ? (
                        <span className="notification">No notification yet..</span>
                    ) : null}
                    {modifiedNotifications &&
                        modifiedNotifications.map((n, index) => {
                            return (
                                <div
                                    key={index}
                                    className={
                                        n.isRead ? "notification" : "notification not-read"
                                    }
                                    onClick={() => {
                                        markNotificationAsRead(n, userChats, user, notifications);
                                        setIsOpen(false);
                                    }}
                                >
                                    <span>{`${n.senderName} sent you a new message`}</span>
                                    <span className="notification-time">
                                        {moment(n.date).calendar()}
                                    </span>
                                </div>
                            );
                        })}
                </div>)
                : null}

        </div>);
}

export default Notification;