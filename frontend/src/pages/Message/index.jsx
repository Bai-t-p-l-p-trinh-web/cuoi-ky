import { MdOutlineMessage } from "react-icons/md";
import { CiBellOn } from "react-icons/ci";
import { useEffect, useState, useRef } from "react";
import { formatTimeStamp, getDate } from "../../utils/formatDate";
import { useFetchUserInfo } from "../../hooks/useFetchUserInfo";
import { IoMdSend } from "react-icons/io";
import { toast, ToastContainer } from "react-toastify";
import "./scss/Message.scss";

import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/axiosConfig";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function Message() {
  const { user, loading, error } = useFetchUserInfo();
  const [chats, setChats] = useState();
  const isLoading = useRef(true);
  const navigate = useNavigate();

  const [selectedThread, setSelectedThread] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [onlineUsersTyping, setOnlineUsersTyping] = useState([]);
  const dates = [];
  const [textMessage, setTextMessage] = useState("");
  const socketRef = useRef();
  const bottomRef = useRef(null);
  const shouldScrool = useRef(true);
  const selectedThreadId = useRef(null);
  const timeoutTyping = useRef(null);
  useEffect(() => {
    if (isLoading.current == false && loading == false && !user) {
      // Clear reload flag when user is not logged in
      sessionStorage.removeItem("messagePageReloaded");
      toast.error("Người dùng chưa đăng nhập vui lòng đăng nhập | đăng ký!");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
    isLoading.current = false;
  }, [user, loading, isLoading.current]);
  // Auto reload page when entering Message page to ensure fresh data
  useEffect(() => {
    if (user?._id && !sessionStorage.getItem("messagePageReloaded")) {
      sessionStorage.setItem("messagePageReloaded", "true");
      window.location.reload();
    }
  }, [user?._id]);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await apiClient.get("/thread/threads");
        setChats(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    getMessages();
  }, []);

  // handle data chatting
  const chattingSuccess = (data) => {
    const { msgId, senderId, text, threadId, timestamp } = data;
    setChats((prev) => {
      if (!prev) return prev;

      const newChats = { ...prev };

      newChats.threads = [...newChats.threads];

      let indexThread = newChats.threads.findIndex(
        (thread) => thread.threadId === threadId
      );
      if (indexThread === -1) return prev;

      const thread = { ...newChats.threads[indexThread] };

      const messages = {
        id: msgId,
        seen: false,
        senderId,
        text,
        timestamp,
      };

      thread.messages = [...thread.messages, messages];

      thread.lastMessage = messages;

      newChats.threads[indexThread] = thread;
      if (selectedThreadId && selectedThreadId.current == threadId) {
        setSelectedThread({ ...thread });
      }

      return newChats;
    });
  };
  // end handle data chatting

  useEffect(() => {
    if (!user?._id) return;

    const socket = io(import.meta.env.VITE_SERVER_URL, {
      withCredentials: true,
    });

    socketRef.current = socket;

    // socket.connect()

    socket.emit("user-online", user._id);

    socket.on("get-online-users", (receiveUsers) => {
      setOnlineUsers(receiveUsers);
    });

    socket.on("get-one-online-user", (receiveUserId) => {
      if (!onlineUsers.includes(receiveUserId)) {
        setOnlineUsers((prev) => [...prev, receiveUserId]);
      }
    });

    socket.on("get-user-disconnect", (receiveUserId) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== receiveUserId));
    });

    socket.on("send-messages-success", (data) => {
      chattingSuccess(data);
      shouldScrool.current = true;
    });

    socket.on("send-messages-fail", () => {
      toast.error("Lỗi khi gửi tin nhắn");
    });

    socket.on("send-messages-to-other", (data) => {
      chattingSuccess(data);
    });

    socket.on("get-other-user-typing", (data) => {
      const { userId } = data;

      if (!onlineUsersTyping.includes(userId)) {
        setOnlineUsersTyping((prev) => [...prev, userId]);
      }
    });

    socket.on("get-other-user-done-typing", (data) => {
      const { userId } = data;
      setOnlineUsersTyping((prev) => prev.filter((id) => id !== userId));
    });

    return () => {
      socket.disconnect();
      socket.off("get-online-users");
      socket.off("get-one-online-user");
      socket.off("get-user-disconnect");
      socket.off("send-messages-success");
      socket.off("send-messages-fail");
      socket.off("send-messages-to-other");
      socket.off("get-other-user-typing");
      socket.off("get-other-user-done-typing");
    };
  }, [user]);

  const sendMessage = (e, threadId) => {
    if (e.key !== "Enter" || e.shiftKey) {
      return;
    }
    e.preventDefault();

    const cleanMessage = textMessage.trim();

    if (!cleanMessage) {
      toast.error("Phải có nội dung khi gửi!");
    }

    socketRef.current?.emit("send-message", {
      threadId,
      senderId: user._id,
      text: cleanMessage,
    });

    setTextMessage("");
  };

  const buttonSendMessage = (e, threadId) => {
    e.preventDefault();

    e.target.disabled = true;
    const cleanMessage = textMessage.trim();

    if (!cleanMessage) {
      toast.error("Phải có nội dung khi gửi!");
    }

    socketRef.current?.emit("send-message", {
      threadId,
      senderId: user._id,
      text: cleanMessage,
    });

    setTextMessage("");
    e.target.disabled = false;
  };

  const handleSendEndTyping = (threadId) => {
    socketRef.current?.emit("user-end-typing", {
      threadId,
      userId: user._id,
    });
  };

  const handleChange = (e, threadId) => {
    const value = e.target.value;
    setTextMessage(value);

    if (timeoutTyping.current) {
      clearTimeout(timeoutTyping.current);
    }

    timeoutTyping.current = setTimeout(() => {
      handleSendEndTyping(threadId);
    }, 3000);

    socketRef.current?.emit("user-typing", {
      threadId,
      userId: user._id,
    });
  };

  useEffect(() => {
    if (selectedThread) {
      if (shouldScrool.current) {
        bottomRef.current?.scrollIntoView({
          block: "end",
          behavior: "smooth",
        });
      }
      selectedThreadId.current = selectedThread.threadId;
    }
    shouldScrool.current = false;
  }, [selectedThread]);
  return (
    <>
      <div className="chat">
        <ToastContainer />
        {chats ? (
          <>
            <div className="chat__header">
              <div className="chat__title">
                <MdOutlineMessage className="chat__title-icon" />
                <span className="chat__title-span">Message</span>
              </div>
              <div className="chat__extend">
                <button className="chat__extend-notification">
                  <CiBellOn />
                </button>
                <div className="chat__extend-vertical"></div>
                <div className="chat__user">
                  <div className="chat__user-avatar">
                    <img
                      src={
                        chats.avatar ||
                        "https://static-00.iconduck.com/assets.00/avatar-default-icon-2048x2048-h6w375ur.png"
                      }
                      alt="avatar"
                    />
                  </div>
                  <div className="chat__user__info">
                    <span className="chat__user__info-name">{chats.name}</span>
                    <span className="chat__user__info-email">
                      {chats.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="chat__messages">
              <div className="chat__messages__users">
                {chats.threads.map((thread, index) => {
                  const otherUser =
                    thread.user1Id === chats.id ? thread.user2 : thread.user1;
                  const otherUserId =
                    thread.user1Id === chats.id
                      ? thread.user2Id
                      : thread.user1Id;

                  return (
                    <div
                      key={index}
                      className={`chat__messages__users__user ${
                        selectedThread?.threadId === thread.threadId
                          ? "picked"
                          : ""
                      } ${
                        thread.lastMessage.seen === false &&
                        thread.lastMessage.senderId !== chats.id
                          ? "received"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedThread({ ...thread });
                        setTextMessage("");
                        shouldScrool.current = true;
                        if (timeoutTyping.current) {
                          clearTimeout(timeoutTyping.current);
                        }
                      }}
                    >
                      <div
                        className="chat__messages__users__user-avatar__contain"
                        data-user-online={onlineUsers.includes(otherUserId)}
                      >
                        <img
                          className="chat__messages__users__user-avatar"
                          src={
                            otherUser.avatar ||
                            "https://static-00.iconduck.com/assets.00/avatar-default-icon-2048x2048-h6w375ur.png"
                          }
                          alt="avatar"
                        />
                      </div>

                      <div className="chat__messages__users__user__infor">
                        <span className="chat__messages__users__user__infor-name">
                          {otherUser.name}
                        </span>
                        <p className="chat__messages__users__user__infor-content">
                          {thread.lastMessage.text.slice(0, 25)}...
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="chat__messages__conversation">
                {selectedThread ? (
                  <div className="chat__chatting">
                    <div className="chat__chatting__header">
                      {selectedThread &&
                        (() => {
                          const otherUser =
                            selectedThread.user1Id === chats.id
                              ? selectedThread.user2
                              : selectedThread.user1;

                          return (
                            <div className="chat__chatting__header__info">
                              <img
                                className="chat__chatting__header__info-img"
                                src={
                                  otherUser.avatar ||
                                  "https://static-00.iconduck.com/assets.00/avatar-default-icon-2048x2048-h6w375ur.png"
                                }
                                alt="avatar"
                              />
                              <div className="chat__chatting__header__info__contain">
                                <div className="chat__chatting__header__info-name">
                                  {otherUser.name}
                                </div>
                                <div className="chat__chatting__header__info-email">
                                  {otherUser.email}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                    </div>
                    <div className="chat__chatting__content" ref={bottomRef}>
                      {selectedThread.messages.map((msg, idx) => {
                        const otherUser =
                          selectedThread.user1Id === chats.id
                            ? selectedThread.user2
                            : selectedThread.user1;
                        const shouldShowDate = !dates.includes(
                          getDate(msg.timestamp)
                        );

                        if (shouldShowDate) {
                          dates.push(getDate(msg.timestamp));
                        }
                        return (
                          <div
                            className="chat__chatting__content-item"
                            key={msg.id}
                          >
                            {shouldShowDate && (
                              <div className="chat__chatting__content__showTime">
                                <span className="chat__chatting__content__showTime__horizontal"></span>
                                <div className="chat__chatting__content__showTime__time">
                                  {formatTimeStamp(msg.timestamp)}
                                </div>
                                <span className="chat__chatting__content__showTime__horizontal"></span>
                              </div>
                            )}
                            <div
                              className={
                                "chat__chatting__content__box " +
                                (msg.senderId === chats.id ? "me " : " ")
                              }
                            >
                              <div className="chat__chatting__content__box__img">
                                <img
                                  className="chat__chatting__content__box-avatar"
                                  src={
                                    (chats.id === msg.senderId
                                      ? chats.avatar
                                      : otherUser.avatar) ||
                                    "https://static-00.iconduck.com/assets.00/avatar-default-icon-2048x2048-h6w375ur.png"
                                  }
                                />
                              </div>

                              <div className="chat__chatting__content__box__contain">
                                <span className="chat__chatting__content__box-name">
                                  {chats.id === msg.senderId
                                    ? chats.name
                                    : otherUser.name}
                                </span>
                                <p
                                  className={`chat__chatting__content__box-text ${
                                    chats.id === msg.senderId ? "sender" : ""
                                  }`}
                                >
                                  {msg.text}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div
                        className={`chat__chatting__content__typing ${
                          (selectedThread.user1Id !== user._id &&
                            onlineUsersTyping.includes(
                              selectedThread.user1Id
                            )) ||
                          (selectedThread.user2Id !== user._id &&
                            onlineUsersTyping.includes(selectedThread.user2Id))
                            ? "typing"
                            : ""
                        }`}
                      >
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                    <div className="chat__input__container">
                      <textarea
                        className="chat__input"
                        placeholder="Nhập tin nhắn..."
                        value={textMessage}
                        onChange={(e) => {
                          handleChange(e, selectedThread.threadId);
                        }}
                        onKeyDown={(e) => {
                          sendMessage(e, selectedThread.threadId);
                        }}
                        rows={1}
                      />
                      <button
                        onClick={(e) => {
                          buttonSendMessage(e, selectedThread.threadId);
                        }}
                        className="chat__input__button"
                      >
                        <IoMdSend />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="chat__messages__conversation__nothing">
                    Chọn một người để bắt đầu hội thoại
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="chat__header">
              <div className="chat__title">
                <MdOutlineMessage className="chat__title-icon" />
                <span className="chat__title-span">Message</span>
              </div>
              <div className="chat__extend">
                <button className="chat__extend-notification">
                  <CiBellOn />
                </button>
                <div className="chat__extend-vertical"></div>
                <div className="chat__user">
                  <div className="chat__user-avatar">
                    {/* <img src={chats.avatar} alt="avatar" /> */}
                    <Skeleton width={50} height={50} />
                  </div>
                  <div className="chat__user__info">
                    <Skeleton
                      width={100}
                      height={20}
                      className="chat__user__info-name"
                    />
                    <Skeleton
                      width={200}
                      height={15}
                      className="chat__user__info-email"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="chat__messages">
              <div className="chat__messages__users">
                {Array(4)
                  .fill()
                  .map((_, idx) => (
                    <div className="chat__messages__users__user" key={idx}>
                      <Skeleton
                        circle
                        height={50}
                        width={50}
                        style={{ marginRight: "10px" }}
                      />
                      <div className="chat__messages__users__infor">
                        <Skeleton width={100} height={15} />
                        <Skeleton width={150} height={10} />
                      </div>
                    </div>
                  ))}
              </div>
              <div className="chat__messages__conversation">
                <div className="chat__chatting">
                  <div className="chat__chatting__header">
                    <div className="chat__chatting__header__info">
                      <Skeleton
                        height={60}
                        width={60}
                        circle
                        style={{ marginRight: "15px" }}
                      />
                      <div>
                        <Skeleton
                          height={25}
                          width={150}
                          style={{ marginBottom: "10px" }}
                        />
                        <Skeleton height={20} width={250} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="chat__chatting__content">
                  {Array(5)
                    .fill()
                    .map((_, idx) => (
                      <div
                        className="chat__chatting__content-item"
                        key={idx}
                        style={{ marginBottom: "20px" }}
                      >
                        <div className="chat__chatting__content__box me">
                          <Skeleton circle height={35} width={35} />
                          <div className="chat__chatting__content__box__contain">
                            <Skeleton width={100} height={12} />
                            <Skeleton width={200} height={20} />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
export default Message;
