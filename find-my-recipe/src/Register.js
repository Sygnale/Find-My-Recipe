import React from 'react';

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstname: "",
      lastname: "",
      email: "",
      username: "",
      password: ""
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleSubmit(event) {
    alert("Success!");
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  render() {
    return (
      <div>
        <h1>Create an account</h1>
        <form onSubmit={this.handleSubmit}>
        <label>
            <p>First name</p>
            <input 
              name="firstname" 
              type="text" 
              value={this.state.firstname} 
              onChange={this.handleChange} />
          </label>
          <label>
            <p>Last name</p>
            <input 
              name="lastname" 
              type="text" 
              value={this.state.lastname} 
              onChange={this.handleChange} />
          </label>
          <label>
            <p>Email</p>
            <input 
              name="email" 
              type="text" 
              value={this.state.email} 
              onChange={this.handleChange} />
          </label>
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
        </form>
      </div>
    );
  }
}