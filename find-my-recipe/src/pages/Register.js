import React from 'react';
import './Register.css';
import { Link } from "react-router-dom";

class Register extends React.Component {
  constructor(props) {
  super(props);
  this.state = {
    username: "",
    password: "",
    error: null,
    response: null,
  };

  this.handleSubmit = this.handleSubmit.bind(this);
  this.handleChange = this.handleChange.bind(this);
  }
  
  // enters valid username and password into database (user, pass cannot be null or "")
  addUser(user, pass) {
    fetch(`http://localhost:8080/add-user/${user}-${pass}`, {
      method: "POST",
    })
    .then(async response => {
      let data = await response.json();          
      if(!response.ok) {
        let err = data;
        return Promise.reject(err);
      }
      this.setState({
        response: data.id,
      });
      this.props.handleStateChange(this.state.response);
    })
    .catch(err => {
      this.setState({
        error: err,
      });
    });
  }
	
	// determines if submitted username and password is valid
  handleSubmit(event) {
    event.preventDefault(); // prevents page from refreshing
    if (this.state.username === "" 
      || this.state.password === ""
      || (this.state.username).includes("-")
      || (this.state.password).includes("-")) {
      this.setState({
        error: "Invalid username or password (must not be empty and cannot contain '-')",
      });
    }
    else {
      this.addUser(this.state.username, this.state.password);
    }
  }
	
	// trace user input
  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  render() {
    const { error, response } = this.state;
    let divText = '';
    if (error) {
      divText = error;
    }
    else {
      divText = response;
    }
    
    return (
      <div className='Register'>
        <div className='left'>
          <form onSubmit={this.handleSubmit}>
            <h1>Create an account</h1>
            <label>
              <input
                name="username"
                type="text"
                placeholder="Username"
                value={this.state.username}
                onChange={this.handleChange} />
            </label>
            <label>
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={this.state.password}
                onChange={this.handleChange} />
            </label>
            <div>
              <button className='SubmitButton' type="submit">SIGN UP</button>
            </div>
          <div> {divText} </div>
          </form>
        </div>
        <div className='right-container'>
          <div className='right'>
            <div className='right-panel'>
              <h1 className>Find My Recipe</h1>
                <p>Already have an account?&nbsp;
                  <Link to='/'>Login</Link>
                </p>
            </div>
          </div>
        </div>
        
      </div>
    );
  }
}

export default Register;