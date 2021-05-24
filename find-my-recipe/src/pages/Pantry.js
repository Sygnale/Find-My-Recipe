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
			console.log("Itsa me!");
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
				pantry: JSON.parse(data)["ingredients"],
			});
		})
		.catch(err => {
			this.setState({
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
		})
		.catch(err => {
			this.setState({
				error: err,
			});
		});
	}

	removeIngredient(event, id) {
		event.preventDefault();
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

	render() {		
		const { error } = this.state;
		let items;
		if (error) {
			items = error;
		}
		else {
			//alert(this.state.pantry);
			items = (this.state.pantry).map((item) => 
				<li className='list' key={item.id}>
					{item.name}{`(${item.amount})`}
					<button className='EmptyButton' onClick={(event) => this.removeIngredient(event, item.id)}>+</button>
				</li>
			);
		}
		
		
		let msg = '';
		if (this.state.action) {
			msg = this.state.action;
		}
		
		//reloading page on Pantry loses user ID, so make user log back in if that happens, but that's another issue

		return (
			<div className='Pantry'>
				<h1>Pantry</h1>
				<Search className='Search' pantry={this.state.pantry} list={this.state.ingredients} addIngredient={this.addIngredient}/>
				<div className='Items'> {items} </div>
				<div>
					<button className='EmptyButton' onClick={this.emptyPantry}>EMPTY PANTRY</button>
				</div>
				<div className='message' >{msg}</div>
			</div>
		);
	}
}


export default Pantry;