import * as React from "react";
import {browserHistory} from "react-router";
import JoinRoom from "../../containers/join-room";
const styles = require("./styles.scss");

interface HomeProps{
  value: string;
}

const Home = () => (
  <div className={styles.home}>
    <h2>Welcome!</h2>
    <p>Join a room</p>
    <JoinRoom />
  </div>
);

export default Home;
