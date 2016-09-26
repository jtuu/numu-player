import * as React from "react";
import {connect} from "react-redux";
import {joinRoom} from "../../actions";
import {browserHistory} from "react-router";

interface JoinRoomProps{
  value?: string;
  dispatch?: Function;
}

const mapStateToProps = (state : JoinRoomProps) => {
  return {};
}

const mapDispatchToProps = (dispatch: Function) : JoinRoomProps => {
  return {dispatch};
};

const decorate = connect<JoinRoomProps, JoinRoomProps, {}>(
  mapStateToProps,
  mapDispatchToProps
);

class JoinRoom extends React.Component<JoinRoomProps, {}>{
  constructor(props){
    super(props);
  }

  refs: {
    [key: string]: (Element);
    input: (HTMLInputElement);
  }

  handleSubmit = event => {
    event.preventDefault();
    let room = encodeURIComponent(this.inputVal.trim());
    if (!room){
      return;
    }
    browserHistory.push(`/room/${room}`);
    this.inputVal = "";
  }

  set inputVal(val){
    this.refs.input.value = val;
  }

  get inputVal(){
    return this.refs.input.value;
  }

  render(){
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="text" ref="input" defaultValue={this.props.value} />
        <button type="submit">Join</button>
      </form>
    );
  }
}

export default decorate(JoinRoom);
