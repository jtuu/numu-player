import * as React from "react";
import ChatUserList from "../chat-user-list";
import ChatLog from "../chat-log";
import SendChatMessage from "../../containers/send-chat-message";
import * as CSSModules from "react-css-modules";
const styles = require("./styles.scss");

const ChatBox = ({users, messages}) => (
  <div className={styles.chatbox}>
    <div className={styles.topcont}>
      <div className={styles.chatlog}>
        <ChatLog messages={messages} />
      </div>
      <div className={styles.userlist}>
        <ChatUserList users={users} />
      </div>
    </div>
    <div className={styles.sendmessage}>
      <SendChatMessage />
    </div>
  </div>
);

export default CSSModules(ChatBox, styles);
