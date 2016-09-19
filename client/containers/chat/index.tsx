import * as React from "react";
import {connect} from "react-redux";
import ChatBox from "../../components/chat-box";

const mapStateToProps = ({room}): ChatBoxProps => {
  const {users, messages} = room.chat;
  return {
    users,
    messages
  };
};

const mapDispatchToProps = (dispatch): ChatBoxProps => {
  return {dispatch};
};

const Chat = connect<ChatBoxProps, ChatBoxProps, {}>(
  mapStateToProps,
  mapDispatchToProps
)(ChatBox);

export default Chat;
