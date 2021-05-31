import React from 'react';
import { Route } from 'react-router-dom';
import SplitPane from 'react-split-pane';
import Pantry from './Pantry';
import Favorites from './Favorites';
import RecipeBox from './RecipeBox';
import './Home.css';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userID: this.props.userID,
      displayOpen: false,
      displayContent: [],
      displayFirst: null,
    };
    
    this.openOn = this.openOn.bind(this);
    this.toggleDisplay = this.toggleDisplay.bind(this);
    this.initDisplay = this.initDisplay.bind(this);
  }
  
  openOn = (i) => {
    this.setState({ 
      displayFirst: i,
    });
  }
  
  toggleDisplay() {
    this.setState({
      displayOpen: !this.state.displayOpen
    });
  }
  
  initDisplay = (stuff) => {
    this.setState({
      displayContent: stuff,
    });
  }
  
  componentDidUpdate(displayOpen, displayContent, displayFirst) {
    console.log(this.state.displayOpen);
    console.log(this.state.displayContent);
    console.log(this.state.displayFirst);
  }
  
  render() {
    const popup = this.state.displayOpen && <RecipeBox recipes={this.state.displayContent} handleClose={this.toggleDisplay} index={this.state.displayFirst} userID={this.state.userID} />;
    
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
          <div className>
            <Route
              render={(props) => (
                <Favorites {...props} userID = {this.state.userID} toggleDisplay={this.toggleDisplay} initDisplay={this.initDisplay} openOn={this.openOn}/>
              )}
            />
          </div>
        </SplitPane>
        
        {popup}
        
      </div>
    );
  }
}

export default Home;