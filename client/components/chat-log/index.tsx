import * as React from "react";
import ChatMessage from "../chat-message";
const styles = require("./styles.scss");

class ChatLog extends React.Component<ChatLogProps, {}>{
  constructor(props){
    super(props);
  }

  static get getDefaultProps(){
    return {messages: []};
  }

  refs: {
    [key: string]: (Element);
    log: (HTMLUListElement);
  }

  componentDidUpdate(){
    this.refs.log.scrollTop = this.refs.log.offsetHeight;
  }

  render(){
    return (
      <div className={styles.chatlog} ref="log">
        {
          this.props.messages.map(msg => (
            <ChatMessage key={msg.id} {...msg} />
          ))
        }
      </div>
    );
  }
}

export default ChatLog;
