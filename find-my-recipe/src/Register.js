import React from 'react';

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
    
    error: null,
      isLoaded: false,
      response: null,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleSubmit(event) {
    fetch(`http://localhost:8080/add-user/${this.state.username}-${this.state.password}`, {
    method: 'POST',
  })
  .then(response => response.json())
  .then(
    (result) => {
      this.setState({
        isLoaded: true,
        response: result
      });
      console.log(result);
    },
    (error) => {
      this.setState({
        isLoaded: true,
        error
      });
      console.log(error);
    }
  );
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  console.log(`${this.state.username}, ${this.state.password}`);
  }

  render() {
  const { error, isLoaded, response } = this.state;
  let divText;
  if (error) {
    divText = error.responseText;
  }
  else if (!isLoaded) {
    divText = "Loading...";
  }
  else {
    divText = response;
  }
     
  console.log(`${this.state.reponse}`);
    return (
      <div>
        <h1>Create an account</h1>
        <form onSubmit={this.handleSubmit}>
          <label>
            <p>Username</p>
            <input 
              name="username" 
              type="text" 
              value={this.state.username} 
              onChange={this.handleChange} />
          </label>
          <label>
            <p>Password</p>
            <input 
              name="password" 
              type="password" 
              value={this.state.password} 
              onChange={this.handleChange} />
          </label>
          <div>
            <button type="submit">Sign up</button>
          </div>
          <div> {divText} </div>
        </form>
      </div>
    );
  }
}

export { Register };