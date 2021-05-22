import React from 'react';
import { Link } from 'react-router-dom';
import Search from './Search';

class Pantry extends React.Component {
  constructor(props) { // props = { userID }
    super(props);
    this.state = {
			ingredients: [],
      pantry: [],
			pantryChanged: false,
			action: null,
      query: null,
      error: null,
    };
		
		this.getPantry = this.getPantry.bind(this);
		this.addIngredient = this.addIngredient.bind(this);
		this.removeIngredient = this.removeIngredient.bind(this);
		this.emptyPantry = this.emptyPantry.bind(this);
		this.managePantry = this.managePantry.bind(this);
	}

	// runs only once when Pantry is created
	componentDidMount() {
		this.getIngredients();
		console.log(this.state.ingredients);
		this.getPantry();
		console.log(this.state.pantry);
	}
	
	// runs everytime listed props are updated
	componentDidUpdate() {
		if(this.state.pantryChanged) {
			this.getPantry();
			this.setState({ pantryChanged: false, });
		}
	}
	
	// runs right before exiting Pantry, cancel in-progress fetches
	componentWillUnmount() {
	}
	
	getIngredients() {
		fetch(`http://localhost:8080/ingredients`, {
				method: "GET",
		})
		.then(async response => {
			let data = await response.json();
			this.setState({
				ingredients: data,
			});
		});
	}

	getPantry() {
		fetch(`http://localhost:8080/${this.props.userID}/ingredients`, {
			method: "GET",
		})
		.then(async response => {
			let data = await response.json();
			if(!response.ok) { // user had no ingredients
				let err = data;
				return Promise.reject(err);
			}
			this.setState({
				pantry: data.ingredients,
			});
		})
		.catch(err => {
			this.setState({
				pantry: [],
				error: "Your pantry is empty. Search to add ingredients.",
			});
		});
	}
	
	addIngredient(id) {
		fetch(`http://localhost:8080/${this.props.userID}/ingredients/${id}`, {
			method: "POST",
		})
		.then(async response => {
			let data = await response.text();
			if(!response.ok) {
				let err = data;
				return Promise.reject(err);
			}
			this.setState({
				action: data,
				pantryChanged: true,
			});
			console.log(`added id: ${id}`);
		})
		.catch(err => {
			this.setState({
				error: err,
			});
		});
	}

	removeIngredient(id) {
		fetch(`http://localhost:8080/${this.props.userID}/ingredients/${id}`, {
			method: "DELETE",
		})
		.then(async response => {
			let data = await response.text();
			if(!response.ok) {
				let err = data;
				return Promise.reject(err);
			}
			this.setState({
				action: data,
				pantryChanged: true,
			});
			console.log(`removed id: ${id}`);
		})
		.catch(err => {
			this.setState({
				error: err,
			});
		});
	}

	emptyPantry() {
		fetch(`http://localhost:8080/${this.props.userID}/ingredients`, {
			method: "DELETE",
		})
		.then(async response => {
			let data = await response.text();
			if(!response.ok) {
				let err = data;
				return Promise.reject(err);
			}
			this.setState({
				action: data,
				pantryChanged: true,
			});
		})
		.catch(err => {
			this.setState({
				error: err,
			});
		});
	}

	managePantry(event, action, id) {
		event.preventDefault();
		switch(action) {
		case 1:
			this.addIngredient(id);
			break;
		case -1:
			this.removeIngredient(id);
			break;
		default:
			break;
		}
	}

	render() {
		const { error } = this.state;
		let items;
		if (this.state.pantry.length === 0) {
			items = error;
		}
		else {
			console.log(this.state.pantry);
			items = (this.state.pantry).map((item) => (
				<li key={item.id}>
					{item.name}{`(${item.amount})`}
					<button onClick={(event) => this.managePantry(event, -1, item.id)}>(-)</button>
				</li>
			));
		}		
		
		let msg = '';
		if (this.state.action) {
			msg = this.state.action;
		}
		
		//reloading page on Pantry loses user ID, so make user log back in if that happens, but that's another issue

		return (
			<div>
				<Search pantry={this.state.pantry} list={this.state.ingredients} handleClick = {this.managePantry}/>
				<h1>Pantry:</h1>
				<div> {items} </div>
				<div>
					<button onClick={this.emptyPantry}>Empty pantry</button>
				</div>
				{msg}
			</div>
		);
	}
}


export default Pantry;