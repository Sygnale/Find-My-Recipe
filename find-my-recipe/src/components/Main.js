import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userID: null,
    };
    this.handleStateChange = this.handleStateChange.bind(this);
  }
  
  handleStateChange(value) {
    this.setState({ userID: value });
  }
  
  render() {
    let redirect = '';
    if (this.state.userID) {
      redirect = <Redirect to='/Home' />;
    }
    else {
      redirect = <Redirect to='/' />;
    }
    return (
      <div>
        {redirect}
        <Switch> {/* The Switch decides which component to show based on the current URL. */}
          <Route
            exact path='/'
            render={(props) => (
              <Login {...props} handleStateChange = {this.handleStateChange}/>
            )}
          />
          <Route
            exact path='/Register'
            render={(props) => (
              <Register {...props} handleStateChange = {this.handleStateChange}/>
            )}
          />
          <Route
            exact path='/Home'
            render={(props) => (
              <Home {...props} userID = {this.state.userID}/>
            )}
          />
        </Switch>
      </div>
    );
  }
}

export default Main;