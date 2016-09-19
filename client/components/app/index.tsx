import * as React from "react";
import NavLink from "../nav-link";
import TopBar from "../top-bar";

const App = ({children} : {children: React.ReactChildren}) => (
  <div>
    <TopBar />

    <div>{children}</div>
  </div>
);

export default App;
