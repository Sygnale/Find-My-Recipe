import React from 'react';
import './App.css';
import Main from './components/Main.js';

<<<<<<< HEAD
import { Login } from './Login.js';
import { Register } from './Register.js';

class App extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
			userID: null,
        };
		
		this.handleStateChange = this.handleStateChange.bind(this);
    }	
	
	handleStateChange(value) {
		this.setState({ userID: value });
	}
	
    render() {
		let header = '';
		if (this.state.userID) {
			header = <h1>Welcome, user #{this.state.userID}!</h1>
		}
		return (
			<div>
				{header}
				<Login handleStateChange = {this.handleStateChange}/>
				<Register handleStateChange = {this.handleStateChange}/>
			</div>
		);
    }
}
=======
const App = () => (
	<div className='app'>
		<Main />
	</div>
);
>>>>>>> multi_page

export default App;
