import * as React from "react";
import {connect} from "react-redux";
import {joinRoom, leaveRoom} from "../../actions";
import Chat from "../chat";
import Player from "../player";
const styles = require("./styles.scss");

const mapStateToProps = ({room}): RoomProps => {
  return {name: room.name};
}

const mapDispatchToProps = (dispatch: Function) : RoomProps => {
  return {dispatch};
};

const decorate = connect<RoomProps, RoomProps, {}>(
  mapStateToProps,
  mapDispatchToProps
);

class Room extends React.Component<RoomProps, {}>{
  constructor(props){
    super(props);
  }

  componentWillMount(){
    this.props.dispatch(joinRoom(this.props.params.roomName));
  }

  componentWillUnmount(){
    this.props.dispatch(leaveRoom(this.props.params.roomName));
  }

  render(){
    return (
      <div className={styles.room}>
        <h2>{this.props.name || "\u00a0"}</h2>
        <div className={styles.container}>
          <div className={styles.chat}>
            <h3>Chat</h3>
            <Chat />
          </div>
          <div className={styles.player}>
            <h3>Music</h3>
            <Player />
          </div>
        </div>
      </div>
    );
  }
}


export default decorate(Room);
