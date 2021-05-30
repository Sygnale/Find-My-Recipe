import React from 'react';
import { Route } from 'react-router-dom';
import SplitPane from 'react-split-pane';
import Tags from './Tags';
import Results from './Results';
import RecipeBox from './RecipeBox';
import './Recipes.css';

class Recipes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userID: this.props.userID,
      updateResults: false,
      displayOpen: false,
      displayContent: [],
      displayFirst: null,
    };
    
    this.handleStateChange = this.handleStateChange.bind(this);
    this.handleDataReset= this.handleDataReset.bind(this);
    
    this.openOn = this.openOn.bind(this);
    this.toggleDisplay = this.toggleDisplay.bind(this);
    this.initDisplay = this.initDisplay.bind(this);
  }
  
  handleStateChange(value) {
    this.setState({ userID: value });
  }

  handleButtonPress = () => {
    this.setState({ updateResults: true });
  }

  handleDataReset(){ 
    this.setState({ updateResults: false});
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

  render() {
    const popup = this.state.displayOpen && <RecipeBox recipes={this.state.displayContent} handleClose={this.toggleDisplay} index={this.state.displayFirst} />;
    
    return (
      <div className>
        <h1 className='title'>Find My Recipe</h1>
        <SplitPane className='Recipes' split="vertical" defaultSize={600}>
          <div className='Tags'>
            <Route
              render={(props) => (
                <Tags {...props} userID = {this.state.userID} updateResults={this.handleButtonPress}/>
              )}
            />
          </div>
          <div className='Results'>
            <Route
              render={(props) => (
                <Results {...props} userID = {this.state.userID} update={this.state.updateResults} resetData={this.handleDataReset} toggleDisplay={this.toggleDisplay} initDisplay={this.initDisplay} openOn={this.openOn}/>
              )}
            />
          </div>
        </SplitPane>
        
        {popup}
        
      </div>
    );
  }
}

export default Recipes;