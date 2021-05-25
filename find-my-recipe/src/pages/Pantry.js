import React from 'react';
import { Link } from 'react-router-dom';
import Search from './Search';

class Pantry extends React.Component {
  constructor(props) { // props = { userID }
    super(props);
    this.state = {
			ingredients: [],
      pantry: [],
      amount: 0,
      unit: 'ounce',
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
				pantry: JSON.parse(data)["ingredients"],
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

  amountConversion(){

    switch(this.state.unit){
      case "ounce":
        this.setState({amount: (this.state.amount / 35.274)});
      break

      case "pound":
        this.setState({amount: (this.state.amount / 2.205)});
      break

      case "gram":
        this.setState({amount: (this.state.amount / 1000)});
      break

      case "kilo":
        return;
      break

      case "teas":
        this.setState({amount: (this.state.amount / 203)});
      break

      case "table":
        this.setState({amount: (this.state.amount / 67.628)});
      break

      case "fl-oz":
        this.setState({amount: (this.state.amount / 33.814)});
      break

      case "cup":
        this.setState({amount: (this.state.amount / 4.167)});
      break

      case "pint":
        this.setState({amount: (this.state.amount / 2.113)});
      break

      case "quart":
        this.setState({amount: (this.state.amount / 1.057)});
      break

      case "gallon":
        this.setState({amount: (this.state.amount / 3.785)});
      break

      case "bushel":
        this.setState({amount: (this.state.amount * 35.239)});
      break

      case "ml":
        this.setState({amount: (this.state.amount / 1000)});
      break

      case "li":
        return;
      break

      default:
        return;

    }

  }

  handleUnitChange(event) {
    this.setState({unit: event.target.unit});
  }

  handleAmountChange(event) {
    this.setState({unit: event.target.amount});
  }

	render() {
		const { error } = this.state;
		let items;
		if (this.state.pantry.length === 0) {
			items = error;
		}
		else {
			//alert(this.state.pantry);
			items = (this.state.pantry).map((item) =>
				<li className='list' key={item.id}>
					{item.name} {`(${item.amount})`} &nbsp;
					<button className='RemoveButton' onClick={(event) => this.removeIngredient(event, item.id)}>-</button>
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
        <input type='number' amount={this.state.amount} onChange={() => this.handleAmountChange} />
        <select unit={this.state.unit} onChange={() => this.handleUnitChange}>
          <option unit="ounce">Ounces</option>
          <option unit="pound">Pounds</option>
          <option unit="gram">Grams</option>
          <option unit="kilo">Kilograms</option>
          <option unit="teas">Teaspoons</option>
          <option unit="table">Tablespoons</option>
          <option unit="fl-oz">Fluid Ounces</option>
          <option unit="cup">Cups</option>
          <option unit="pint">Pints</option>
          <option unit="quart">Quarts</option>
          <option unit="gallon">Gallons</option>
          <option unit="bushel">Bushels</option>
          <option unit="ml">Milliliters</option>
          <option unit="li">Liters</option>
        </select>
			</div>
		);
	}
}


export default Pantry;
