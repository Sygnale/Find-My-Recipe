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
    var context=this;
    fetch("http://localhost:8080/ingredients")
    .then(res => res.json())
    .then(
      (result) => {
        this.setState({
          isLoaded: true,
          response: result
        });
      },
      (error) => {
        this.setState({
          isLoaded: true,
          error
        });
      }
    )
  }

  render(){
    const { error, isLoaded, response } = this.state;
    let divText;
    if(error){
      divText=error.responseText;
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
