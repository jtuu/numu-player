import * as React from "react";
import ChatUser from "../chat-user";
const styles = require("./styles.scss");

class ChatUserList extends React.Component<ChatUserListProps, {}>{
  constructor(props){
    super(props);
  }

  static get getDefaultProps(){
    return {users: []};
  }

  render(){
    return (
      <ul className={styles.userlist}>
        {
          this.props.users.map(user => (
            <ChatUser key={user.id} {...user} />
          ))
        }
      </ul>
    )
  }
}

export default ChatUserList;
