import * as React from "react";
import {connect} from "react-redux";
const styles = require("./styles.scss");
import {changeOwnNick} from "../../actions";

interface UserQuickmenuProps{
  name?: string;
  dispatch?: Function;
}

const mapStateToProps = ({account}): UserQuickmenuProps => {
  return {name: account.name};
};

const mapDispatchToProps = (dispatch): UserQuickmenuProps => {
  return {dispatch};
};

const decorate = connect<UserQuickmenuProps, UserQuickmenuProps, {}>(
  mapStateToProps,
  mapDispatchToProps
);

const UserQuickmenu = ({name, dispatch}) => (
  <a className={styles.cont} href="javascript:void(0)" onClick={(event) => {
    const newNick = window.prompt("New nickname:");
    if(newNick){
      dispatch(changeOwnNick(name, newNick));
    }
  }}>
    <div className={styles.avatar}></div>
    <div className={styles.name}>{name || "Not logged in"}</div>
  </a>
);

export default decorate(UserQuickmenu);
