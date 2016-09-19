import * as React from "react";
import {Route, IndexRoute} from "react-router";
import App from "./components/app";
import Home from "./components/home";
import Room from "./containers/room";

export default (
  <Route path="/" component={App}>
    <IndexRoute component={Home} />
    <Route path="/room/:roomName" component={Room} />
  </Route>
);
