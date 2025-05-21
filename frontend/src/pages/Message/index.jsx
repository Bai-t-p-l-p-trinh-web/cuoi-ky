import { MdOutlineMessage } from "react-icons/md";
import { CiBellOn } from "react-icons/ci";
import { useState } from "react";
import { formatTimeStamp, getDate } from "../../utils/formatDate";
import "./scss/Message.scss";

function Message(){
    const chats = {
        id : "1001",
        name : "Nguyễn Văn A",
        email: "nguyenvana@gmail.com",
        avatar: "https://i.pinimg.com/236x/6c/99/d8/6c99d882f8eec65f9ee0bd502c17ac84.jpg",
        threads: [
            {
                threadId : "thread_1",
                user1Id : "1001",
                user2Id : "1002",
                user1 : {
                    name: "Nguyễn Văn A",
                    email: "nguyenvana@gmail.com",
                    avatar: "https://i.pinimg.com/236x/6c/99/d8/6c99d882f8eec65f9ee0bd502c17ac84.jpg",
                },
                user2 : {
                    name: "Nguyễn Văn Bủ",
                    email: "nguyenvanb@gmail.com",
                    avatar: "https://i.pinimg.com/564x/04/02/00/040200884ec28cc972d89f1fe9983c7e.jpg"
                },
                lastMessage : {
                    id: "msg_101",
                    senderId: "1002",
                    text: "Chào hôm nay khỏe chứ",
                    timestamp : "2025-05-20T08:30:00Z",
                    seen : true
                },
                messages: [
                    {
                        "id": "msg_100",
                        "senderId": "1001",
                        "text": "Bạn đang làm gì đấy?",
                        "timestamp": "2025-05-20T08:00:00Z",
                        "seen": true
                      },
                      {
                        "id": "msg_101",
                        "senderId": "1002",
                        "text": "Ok, mai gặp nhé!",
                        "timestamp": "2025-05-20T08:30:00Z",
                        "seen": true
                      }
                ]
            },,
        {
            threadId: "thread_2",
            user1Id: "1001",
            user2Id: "1003",
            user1: {
                name: "Nguyễn Văn A",
                email: "nguyenvana@gmail.com",
                avatar: "https://i.pinimg.com/236x/6c/99/d8/6c99d882f8eec65f9ee0bd502c17ac84.jpg",
            },
            user2: {
                name: "Phạm Thị Nở",
                email: "thino@gmail.com",
                avatar: "https://i.pinimg.com/736x/a1/9c/8e/a19c8ed16c645daa0208a5c2169789cb.jpg"
            },
            lastMessage: {
                id: "msg_202",
                senderId: "1003",
                text: "Tớ gửi file rồi nhé!",
                timestamp: "2025-05-19T21:00:00Z",
                seen: false
            },
            messages: [
                {
                    id: "msg_200",
                    senderId: "1001",
                    text: "Bạn gửi tài liệu chưa?",
                    timestamp: "2025-05-19T20:30:00Z",
                    seen: true
                },
                {
                    id: "msg_202",
                    senderId: "1003",
                    text: "Tớ gửi file rồi nhé!",
                    timestamp: "2025-05-19T21:00:00Z",
                    seen: false
                }
            ]
        },
        {
            threadId: "thread_3",
            user1Id: "1001",
            user2Id: "1004",
            user1: {
                name: "Nguyễn Văn A",
                email: "nguyenvana@gmail.com",
                avatar: "https://i.pinimg.com/236x/6c/99/d8/6c99d882f8eec65f9ee0bd502c17ac84.jpg",
            },
            user2: {
                name: "Garen Demacia",
                email: "garendemacia@gmail.com",
                avatar: "https://i.pinimg.com/236x/2b/02/19/2b0219ca93860ceb9300b6f5be3aa23e.jpg"
            },
            lastMessage: {
                id: "msg_303",
                senderId: "1001",
                text: "Hẹn gặp cậu lúc 5h nhé!",
                timestamp: "2025-05-18T17:15:00Z",
                seen: true
            },
            messages: [
                {
                    id: "msg_301",
                    senderId: "1004",
                    text: "Chiều nay có rảnh không?",
                    timestamp: "2025-05-18T16:30:00Z",
                    seen: true
                },
                {
                    id: "msg_303",
                    senderId: "1001",
                    text: "Hẹn gặp cậu lúc 5h nhé!",
                    timestamp: "2025-05-18T17:15:00Z",
                    seen: true
                }
            ]
        },
        {
            threadId: "thread_4",
            user1Id: "1001",
            user2Id: "1005",
            user1: {
                name: "Nguyễn Văn A",
                email: "nguyenvana@gmail.com",
                avatar: "https://i.pinimg.com/236x/6c/99/d8/6c99d882f8eec65f9ee0bd502c17ac84.jpg",
            },
            user2: {
                name: "Phạm Thị C",
                email: "phamthic@gmail.com",
                avatar: "https://i.pinimg.com/474x/6d/a6/60/6da6608210f1339ee5287ee575f9460b.jpg"
            },
            lastMessage: {
                id: "msg_202",
                senderId: "1005",
                text: "Tớ gửi file rồi nhé!",
                timestamp: "2025-05-19T21:00:00Z",
                seen: false
            },
            messages: [
                {
                    id: "msg_200",
                    senderId: "1001",
                    text: "Bạn gửi tài liệu chưa?",
                    timestamp: "2025-05-19T20:30:00Z",
                    seen: true
                },
                {
                    id: "msg_202",
                    senderId: "1005",
                    text: "Tớ gửi file rồi nhé!",
                    timestamp: "2025-05-19T21:00:00Z",
                    seen: false
                }
            ]
        },
        {
            threadId: "thread_5",
            user1Id: "1001",
            user2Id: "1006",
            user1: {
                name: "Nguyễn Văn A",
                email: "nguyenvana@gmail.com",
                avatar: "https://i.pinimg.com/236x/6c/99/d8/6c99d882f8eec65f9ee0bd502c17ac84.jpg"
            },
            user2: {
                name: "Lê Hữu Dũng",
                email: "leduong@gmail.com",
                avatar: "https://i.pinimg.com/564x/49/c9/58/49c95817f95d5c1b940e3f4f71f96f18.jpg"
            },
            lastMessage: {
                id: "msg_303",
                senderId: "1001",
                text: "Hẹn gặp cậu lúc 5h nhé! adsf afasfd asfd adfs as df",
                timestamp: "2025-05-18T17:15:00Z",
                seen: false
            },
            messages: [
                {
                    id: "msg_301",
                    senderId: "1006",
                    text: "Chiều nay có rảnh không?",
                    timestamp: "2025-05-18T16:30:00Z",
                    seen: true
                },
                {
                    id: "msg_303",
                    senderId: "1001",
                    text: "Hẹn gặp cậu lúc 5h nhé! adsf afasfd asfd adfs as df",
                    timestamp: "2025-05-18T17:15:00Z",
                    seen: false
                }
            ]
        }
        ]
    };
    const [selectedThread, setSelectedThread] = useState(null);
    const dates = [];
    

    return (
        <>
            <div className="chat">
                <div className="chat__header">
                    <div className="chat__title">
                        <MdOutlineMessage className="chat__title-icon"/>
                        <span className="chat__title-span">Message</span>
                    </div>  
                    <div className="chat__extend">
                        <button className="chat__extend-notification">
                            <CiBellOn/>
                        </button>
                        <div className="chat__extend-vertical"></div>
                        <div className="chat__user">
                            <div className="chat__user-avatar">
                                <img src={chats.avatar} alt="avatar" />
                            </div>
                            <div className="chat__user__info">
                                <span className="chat__user__info-name">{chats.name}</span>
                                <span className="chat__user__info-email">{chats.email}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="chat__messages">
                    <div className="chat__messages__users">
                        {
                            chats.threads.map((thread, index) => {
                                const otherUser = thread.user1Id === chats.id ? thread.user2 : thread.user1;

                                return (
                                    <div 
                                        key={index}
                                        className={`chat__messages__users__user ${selectedThread?.threadId === thread.threadId ? 'picked' : ''} ${(thread.lastMessage.seen === false && thread.lastMessage.senderId !== chats.id) ? "received" : ""}`}
                                        onClick={() => {setSelectedThread(thread)}}
                                    >
                                        <img className="chat__messages__users__user-avatar" src={otherUser.avatar} alt="avatar" />
                                        <div className="chat__messages__users__user__infor">
                                            <span className="chat__messages__users__user__infor-name">{otherUser.name}</span>
                                            <p className="chat__messages__users__user__infor-content">
                                                {thread.lastMessage.text.slice(0, 25)}...
                                            </p>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className="chat__messages__conversation">
                        {
                            selectedThread ? (
                                <div className="chat__chatting">
                                    <div className="chat__chatting__header">
                                        {
                                            selectedThread && (() => {
                                                const otherUser = selectedThread.user1Id === chats.id ? selectedThread.user2 : selectedThread.user1; 
                                                
                                                return (
                                                    <div 
                                                        className="chat__chatting__header__info"
                                                    >
                                                        <img className="chat__chatting__header__info-img" src={otherUser.avatar} alt="avatar" />
                                                        <div className="chat__chatting__header__info__contain">
                                                            <div className="chat__chatting__header__info-name">{otherUser.name}</div>
                                                            <div className="chat__chatting__header__info-email">{otherUser.email}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })()
                                        }
                                    </div>
                                    <div className="chat__chatting__content">
                                        {
                                            selectedThread.messages.map((msg) => {
                                                const otherUser = selectedThread.user1Id === chats.id ? selectedThread.user2 : selectedThread.user1; 
                                                const shouldShowDate = !dates.includes(getDate(msg.timestamp));
                                                if(shouldShowDate){
                                                    dates.push(getDate(msg.timestamp));
                                                }
                                                return (
                                                    <div 
                                                        className="chat__chatting__content-item"
                                                        key={msg.id}
                                                    >
                                                        {
                                                            shouldShowDate && (
                                                                <div className="chat__chatting__content__showTime">
                                                                    <span className="chat__chatting__content__showTime__horizontal"></span>
                                                                    <div className="chat__chatting__content__showTime__time">
                                                                        {formatTimeStamp(msg.timestamp)}
                                                                    </div>
                                                                    <span className="chat__chatting__content__showTime__horizontal"></span>
                                                                </div>
                                                            )
                                                        }
                                                        <div className={"chat__chatting__content__box " + (msg.senderId === chats.id ? "me " : " ")}>
                                                            <div className="chat__chatting__content__box__img">
                                                                <img className="chat__chatting__content__box-avatar" src={chats.id === msg.senderId ? chats.avatar : otherUser.avatar} />
                                                            </div>
                                                            
                                                            <div className="chat__chatting__content__box__contain">
                                                                <span className="chat__chatting__content__box-name">{chats.id === msg.senderId ? chats.name : otherUser.name}</span>
                                                                <p className="chat__chatting__content__box-text">
                                                                    {msg.text}
                                                                </p>
                                                            </div>
                                                            
                                                        </div>
                                                        
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                </div>
                            ) : (
                                <div className="chat__messages__conversation__nothing">
                                    Chọn một người để bắt đầu hội thoại
                                </div>
                            )
                        }
                    </div>
                </div>
            </div>
        </>
    )
};
export default Message;