import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { BrowserRouter } from "react-router-dom";
import * as serviceWorker from "./serviceWorker";
import { Header, Footer } from "./components/MainPage";
import CssBaseline from "@material-ui/core/CssBaseline";

import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";

import pink from "@material-ui/core/colors/pink";
import "./css/style.scss";
import rootReducer from "./reducers";
import "./fontawesome";
import ContainerMain from "./ContainerMain";

const store = createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

const theme = {
  palette: {
    primary: {
      main: "#3367cc"
    },
    secondary: pink
  }
};

ReactDOM.render(
  <Provider store={store}>
    <MuiThemeProvider theme={createMuiTheme(theme)}>
      <div style={{ display: "flex" }}>
        <BrowserRouter>
          <CssBaseline />
          <Header />
          <ContainerMain />
        </BrowserRouter>
      </div>
      <Footer />
    </MuiThemeProvider>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
