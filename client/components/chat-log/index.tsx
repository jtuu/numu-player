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
    container: (HTMLDivElement);
    log: (HTMLDivElement);
  }

  componentDidUpdate(){
    this.refs.container.scrollTop = this.refs.log.offsetHeight;
  }

  render(){
    return (
      <div ref="container" className={styles.container}>
        <div className={styles.chatlog} ref="log">
          {
            this.props.messages.map(msg => (
              <ChatMessage key={msg.id} {...msg} />
            ))
          }
        </div>
      </div>
    );
  }
}

export default ChatLog;
