import React from 'react';
import { Route } from 'react-router-dom';
import SplitPane from 'react-split-pane';
import Pantry from './Pantry';
import Favorites from './Favorites';
import './Home.css';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userID: this.props.userID,
    };
    
    this.handleStateChange = this.handleStateChange.bind(this);
  }
  
  handleStateChange(value) {
    this.setState({ userID: value });
  }

  render() {
    return (
      <div className>
        <h1 className='title'>Find My Recipe</h1>
        <SplitPane className='Home' split="vertical" defaultSize={600}>
          <div className>
            <Route
              render={(props) => (
                <Pantry {...props} userID = {this.state.userID}/>
              )}
            />
          </div>
          <div className='Favorites'>
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