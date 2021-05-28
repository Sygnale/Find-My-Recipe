import React from 'react';
import { Route } from 'react-router-dom';
import SplitPane from 'react-split-pane';
import Tags from './Tags';
import Results from './Results';
import './Recipes.css';

class Recipes extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userID: this.props.userID,
      updateResults: false,
    };
    
    this.handleStateChange = this.handleStateChange.bind(this);
    this.handleDataReset= this.handleDataReset.bind(this);
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

  render() {
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
                <Results {...props} userID = {this.state.userID} update={this.state.updateResults} resetData={this.handleDataReset}/>
              )}
            />
          </div>
        </SplitPane>
      </div>
    );
  }
}

export default Recipes;