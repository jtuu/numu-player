import * as React from "react";
import {connect} from "react-redux";
import {sendChatMessage} from "../../actions";
const styles = require("./styles.scss");

interface SendChatMessageProps{
  ownNick?: string;
  text?: string;
  dispatch?: Function;
}

const mapStateToProps = ({account}): SendChatMessageProps => {
  return {ownNick: account.name};
};

const mapDispatchToProps = (dispatch) : SendChatMessageProps => {
  return {dispatch};
};

const decorate = connect<SendChatMessageProps, SendChatMessageProps, {}>(
  mapStateToProps,
  mapDispatchToProps
);

class SendChatMessage extends React.Component<SendChatMessageProps, {}>{
  constructor(props){
    super(props);
  }

  refs: {
    [key: string]: (Element);
    input: (HTMLInputElement);
  }

  handleSubmit = event => {
    event.preventDefault();
    let text = this.inputVal.trim();
    if(!text){
      return;
    }
    this.props.dispatch(sendChatMessage({
      nick: this.props.ownNick,
      text,
      timestamp: new Date()
    }));
    this.inputVal = "";
  }

  set inputVal(val){
    this.refs.input.value = val;
  }

  get inputVal(){
    return this.refs.input.value;
  }

  componentDidMount(){
    this.refs.input.focus();
  }

  render(){
    return (
      <form className={styles.form} onSubmit={this.handleSubmit}>
        <input className={styles.input} type="text" ref="input" />
        <button type="submit">Send</button>
      </form>
    )
  }
}

export default decorate(SendChatMessage);
