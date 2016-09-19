import * as React from "react";
import * as CSSModules from "react-css-modules";
const styles = require("./styles.scss");

function prettyDate(date: Date){
  date = new Date(String(date));
  return `${
    String("00" + date.getHours()).slice(-2)
  }:${
    String("00" + date.getMinutes()).slice(-2)
  }:${
    String("00" + date.getSeconds()).slice(-2)
  }`;
}

const ChatMessage = ({nick, text, timestamp}: ChatMessageProps) => {
  const nickEl = nick ? (<span className={styles.nick}>{nick}</span>) : null;

  return (
    <li className={styles.message}>
      <span className={styles.timestamp}>{prettyDate(timestamp)}</span>
      {nickEl}
      <span className={styles.text}>{text}</span>
    </li>
  );
};

export default CSSModules(ChatMessage, styles);
