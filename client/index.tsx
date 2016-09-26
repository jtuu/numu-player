import * as React from "react";
import {render} from "react-dom";
import {Router, Route, browserHistory, IndexRoute} from "react-router";
import App from "./components/app";
import Home from "./components/home";
import Root from "./containers/root";
import store from "./store";

render(
  <Root store={store} history={browserHistory} />,
  document.getElementById("app-root")
);

window["store"] = store;
