import * as React from "react";
import {browserHistory} from "react-router";
import JoinRoom from "../../containers/join-room";
import RoomList from "../../containers/room-list";
const styles = require("./styles.scss");

const Home = ({activeRooms}) => (
  <div className={styles.home}>
    <h2>Welcome!</h2>
    <p>Join a room</p>
    <JoinRoom />
    <hr />
    <h3>Currently active rooms:</h3>
    <RoomList />
  </div>
);

export default Home;
