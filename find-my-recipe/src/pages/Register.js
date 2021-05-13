import React from 'react';
import { Link } from "react-router-dom";

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
  
  // user, pass cannot be null or ""
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
	  event.preventDefault(); //prevents page from refreshing
	  if (this.state.username == "" 
			|| this.state.password == ""
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

  handleChange(event) {
	  this.setState({[event.target.name]: event.target.value});
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
			divText = response;
		}
		
		if (response) {
			console.log(response);
		}
		
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

export default Register;
