import * as React from "react";
import NavLink from "../nav-link";
import UserQuickmenu from "../../containers/user-quickmenu";
const styles = require("./styles.scss");

const TopBar = () => (
  <div className={styles.topbar}>
    <div className={styles.left}>
      <h1>
        <NavLink to="/" onlyActiveOnIndex={true}>Numu-player</NavLink>
      </h1>
    </div>
    <div className={styles.right}>
      <UserQuickmenu />
    </div>
  </div>
);

export default TopBar;
