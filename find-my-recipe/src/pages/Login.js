import React from 'react';
import './Login.css';
import { Link } from "react-router-dom";

class Login extends React.Component {
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

  // user, pass cannot be null or ""
  authenUser(user, pass) {
    fetch(`http://localhost:8080/authenticate-user/${user}-${pass}`, {
      method: "GET",
    })
   .then(async response => {
     let data = await response.json();       
     if(!response.ok) {
       let err = data;
       return Promise.reject(err);
     }       
     console.log(data);
     this.setState({
       isLoaded: true,
       response: data.id,
     });
     this.props.handleStateChange(this.state.response);
   })
   .catch(err => {
     console.log(err);
     this.setState({
       isLoaded: true,
       error: err,
     });
   });
  }

  handleSubmit(event) {
    event.preventDefault(); // prevents page from refreshing
    if (this.state.username == "" 
      || this.state.password == ""
      || (this.state.username).includes("-")
      || (this.state.password).includes("-")) {
      this.setState({
        error: "Invalid username or password (must not be empty and cannot contain '-')",
      });
    }
    else {
      this.authenUser(this.state.username, this.state.password);
    }
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  render() {
    const { error, isLoaded, response } = this.state;
    let divText;
    if (error) {
      divText = error;
    }
    else if (!isLoaded) {
      divText = "Loading...";
    }
    else {
      divText = `userId: ${response}`;
    }
    
    if (response) {
      console.log(JSON.stringify(response));
    }
  
    return (
      <div className='Login'>
        <div className='left'>
          <form onSubmit={this.handleSubmit}>
          <h1>Login</h1>
            <label>
              <input
                name="username"
                type="text"
                placeholder='Username'
                value={this.state.username}
                onChange={this.handleChange} />
            </label>
            <label>
              <input
                name="password"
                type="password"
                placeholder='Password'
                value={this.state.password}
                onChange={this.handleChange} />
            </label>
            <div>
              <button className='SubmitButton' type="submit">SIGN IN</button>
            </div>
          </form>
        </div>
        <div className='right-container'>
          <div className='right'>
            <div className='right-panel'>
              <h1 className='title'>Find My Recipe</h1>
              <p>New?&nbsp;
                <Link to='/Register'>Create a new account</Link>
              </p>
            </div>
          </div>
        </div>
        <div> {divText} </div>
      </div>
    );
  }
}

export default Login;