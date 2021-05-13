import React from 'react';
import { Link } from "react-router-dom";

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
<<<<<<< HEAD:find-my-recipe/src/Login.js
    
      error: null,
=======

	  error: null,
>>>>>>> multi_page:find-my-recipe/src/pages/Login.js
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
<<<<<<< HEAD:find-my-recipe/src/Login.js
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
		  this.authenUser(this.state.username, this.state.password);
	  }
=======
	fetch(`http://localhost:8080/authenticate-user/${this.state.username}-${this.state.password}`, {
		method: 'GET',
	})
	.then(res => res.json())
	.then(
		(result) => {
			this.setState({
				isLoaded: true,
				response: result,
			});
			console.log(result);
		},
		(error) => {
			this.setState({
				isLoaded: true,
				error,
			});
			console.log(error);
		}
	);
>>>>>>> multi_page:find-my-recipe/src/pages/Login.js
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  render() {
	const { error, isLoaded, response } = this.state;
	let divText;
	if (error) {
<<<<<<< HEAD:find-my-recipe/src/Login.js
		divText = error;
=======
		divText = error.responseText;
>>>>>>> multi_page:find-my-recipe/src/pages/Login.js
	}
	else if (!isLoaded) {
		divText = "Loading...";
	}
	else {
<<<<<<< HEAD:find-my-recipe/src/Login.js
		divText = `userId: ${response}`;
	}
	
	if (response) {
		console.log(JSON.stringify(response));
	}
	
=======
		divText = response;
	}

>>>>>>> multi_page:find-my-recipe/src/pages/Login.js
    return (
      <div>
        <h1>Find My Recipe</h1>
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
            <button type="submit">Sign in</button>
          </div>
        </form>
        <div>
          <p>New?
            <Link to='/Register'>Create a new account</Link>
          </p>
        </div>
		<div> {divText} </div>
      </div>
    );
  }
}

export default Login;
