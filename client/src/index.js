import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import * as serviceWorker from './serviceWorker';
// import { Container } from 'react-bootstrap';
import { Header, Footer } from './components/MainPage';
import CssBaseline from '@material-ui/core/CssBaseline';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import pink from '@material-ui/core/colors/pink';

// import './css/bootstrap.min.css';
import './fontawesome';
import ContainerMain from './ContainerMain';
const theme = {
  palette: {
    primary: {
      main: '#3367cc',
    },
    secondary: pink,
  },
}

ReactDOM.render(
  <MuiThemeProvider theme={createMuiTheme(theme)}>
    <div style={{ display: 'flex' }}>
      <BrowserRouter>
        <CssBaseline />
        <Header />
        <ContainerMain />
      </BrowserRouter>
    </div>
    <Footer />
  </MuiThemeProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
