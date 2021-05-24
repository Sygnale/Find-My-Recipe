import React from 'react';
import { Route } from 'react-router-dom';
import SplitPane from 'react-split-pane';
import Pantry from './Pantry';
import Favorites from './Favorites';

class Home extends React.Component {
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
    return (
      <div>
        <h1>Find My Recipe</h1>
        <SplitPane split="vertical" defaultSize={600}>
          <div>
            <Route
              render={(props) => (
                <Pantry {...props} userID = {this.state.userID}/>
              )}
            />
          </div>
          <div>
            <Route
              render={(props) => (
                <Favorites {...props} userID = {this.state.userID}/>
              )}
            />
          </div>
        </SplitPane>
      </div>
    );
  }
}

export default Home;