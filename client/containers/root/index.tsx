import * as React from "react";
import {Provider} from "react-redux";
import {Router} from "react-router";
import routes from "../../routes";

interface RootProps{
  store;
  history;
}

const Root = ({store, history} : RootProps) => (
  <Provider store={store}>
    <Router history={history} routes={routes} />
  </Provider>
);

export default Root;
