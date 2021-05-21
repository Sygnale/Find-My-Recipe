import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Login from '../pages/Login';
import Register from '../pages/Register';

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
    let header = '';
    if (this.state.userID) {
      header = <h1>Welcome, user #{this.state.userID}!</h1>
    }
    return (
      <div>
        {header}
        <Switch> {/* The Switch decides which component to show based on the current URL. */}
          <Route
            exact path='/'
            render={(props) => (
              <Login {...props} handleStateChange = {this.handleStateChange}/>
            )}
          />
            component={Login}>
          <Route
            exact path='/Register'
            render={(props) => (
              <Register {...props} handleStateChange = {this.handleStateChange}/>
            )}
          />

        </Switch>
      </div>
    );
  }
}

export default Main;