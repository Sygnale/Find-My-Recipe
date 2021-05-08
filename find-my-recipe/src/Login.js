import React from 'react';

class Login extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username: "",
			password: ""
		};
	}

	handleSubmit(event) {
		return;
	}

	handleChange(event) {
		this.setState({[event.target.name]: event.target.value});
	}

	render() {
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
					<p>New? Create an account</p>
				</div>
			</div>
		);
	}
}