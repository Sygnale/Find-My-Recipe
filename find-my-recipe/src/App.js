import React from 'react';
import './App.css';

class App extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      response: null
    };
  }
  componentDidMount() {
    fetch("http://localhost:8080")
      .then(function(response){
        this.setState({
          isLoaded:true,
          response: response
        });
      })
      .catch((error)=>{
        this.setState({
          isLoaded:true,
          error: error
        });
      });
  }

  render(){
    const { error, isLoaded, response } = this.state;
    let divText;
    if(error){
      divText=error.message;
    }
    else if(!isLoaded){
      divText="Loading...";
    }
    else{
      divText=response;
    }
    return (
      <div className="App">
        <header className="App-header">Find My Recipe
        </header>
        <div>{divText}</div>
      </div>
    );
  }
}

export default App;
