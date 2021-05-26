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
      amount: 0,
      unit: 'ounce',
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
	componentDidUpdate(pantryChanged) {
		if(this.state.pantryChanged) {
			this.getPantry();
			console.log(this.state.pantry);
			this.setState({ pantryChanged: false });
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
			console.log(data.ingredients);
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
				error: null,
				pantryChanged: true,
			});
		})
		.catch(err => {
			this.setState({
				error: err,
			});
		});
	}

  addIngredientAmount(id) {
    fetch(`http://localhost:8080/${this.props.userID}/ingredients/${id}/${this.state.amount}`, {
      method: "PUT",
    })
    .then(async response => {
      let data = await response.text();
      if(!response.ok) {
        let err = data;
        return Promise.reject(err);
      }
      this.setState({
        action: data,
        error: null,
        pantryChanged: true,
      });
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
				error: null,
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
			method: 'DELETE',
		})
		.then(async response => {
			let data = await response.text();
			if(!response.ok) {
				let err = data;
				return Promise.reject(err);
			}
			this.setState({
				action: data,
				error: null,
				pantryChanged: true,
			});
		})
		.catch(err => {
			this.setState({
				error: err,
			});
		});
	}

	managePantry(act, id) {
		switch(act) {
			case 1:
        this.amountConversion();
				this.addIngredient(id);
        this.addIngredientAmount(id);
        this.setState({amount: 0});
				break;
			case -1:
				this.removeIngredient(id);
        this.setState({amount: 0});
				break;
			default:
				break;

		}
	}

  amountConversion() {

    switch(this.state.unit){
      case "ounce":
        this.setState({amount: (Math.round((this.state.amount / 35.274) * 1000) / 1000)});
      break;

      case "pound":
        this.setState({amount: (Math.round((this.state.amount / 2.205) * 1000) / 1000)});
      break;

      case "gram":
        this.setState({amount: (Math.round((this.state.amount / 1000) * 1000) / 1000)});
      break;

      case "kilo":
        return;

      case "teas":
        this.setState({amount: (Math.round((this.state.amount / 203) * 1000) / 1000)});
      break;

      case "table":
        this.setState({amount: (Math.round((this.state.amount / 67.628) * 1000) / 1000)});
      break;

      case "fl-oz":
        this.setState({amount: (Math.round((this.state.amount / 33.814) * 1000) / 1000)});
      break;

      case "cup":
        this.setState({amount: (Math.round((this.state.amount / 4.167) * 1000) / 1000)});
      break;

      case "pint":
        this.setState({amount: (Math.round((this.state.amount / 2.113) * 1000) / 1000)});
      break;

      case "quart":
        this.setState({amount: (Math.round((this.state.amount / 1.057) * 1000) / 1000)});
      break;

      case "gallon":
        this.setState({amount: (Math.round((this.state.amount / 3.785) * 1000) / 1000)});
      break;

      case "bushel":
        this.setState({amount: (Math.round((this.state.amount * 35.239) * 1000) / 1000)});
      break;

      case "ml":
        this.setState({amount: (Math.round((this.state.amount / 1000) * 1000) / 1000)});
      break;

      case "li":
        return;

      default:
        return;

    }

  }

  handleUnitChange = (event)=> {
    this.setState({unit: event.target.value});
  }

  handleAmountChange = (event)=> {

    let preAmount = parseFloat(event.target.value);

    if (preAmount < 0)
      preAmount=0;

    this.setState({amount: preAmount});

  }

	render() {
		const { error } = this.state;
		let items = (this.state.pantry).map((item) =>
				<li className='list' key={item.id}>
					{item.name} {`(${item.amount})`} &nbsp;
					<button className='RemoveButton' onClick={(event) => {
						event.preventDefault();
						this.managePantry(-1, item.id);
					}}>-</button>
				</li>
			);

		let msg = '';
		if (this.state.action) {
			msg = this.state.action;
		}

		//reloading page on Pantry loses user ID, so make user log back in if that happens, but that's another issue

		return (
			<div className='Pantry'>
				<h1>Pantry</h1>
				<Search className='Search' pantry={this.state.pantry} list={this.state.ingredients} managePantry={this.managePantry}/>
				<div className='Items'> {error}{items} </div>
				<div>
					<button className='EmptyButton' onClick={this.emptyPantry}>EMPTY PANTRY</button>
				</div>
				<div className='message' >{msg}</div>
        <input type='number' name="amountInput" value={this.state.amount} onChange={this.handleAmountChange} min="0" />
        <select defUnit={this.state.unit} onChange={this.handleUnitChange}>
          <option value="ounce">Ounces</option>
          <option value="pound">Pounds</option>
          <option value="gram">Grams</option>
          <option value="kilo">Kilograms</option>
          <option value="teas">Teaspoons</option>
          <option value="table">Tablespoons</option>
          <option value="fl-oz">Fluid Ounces</option>
          <option value="cup">Cups</option>
          <option value="pint">Pints</option>
          <option value="quart">Quarts</option>
          <option value="gallon">Gallons</option>
          <option value="bushel">Bushels</option>
          <option value="ml">Milliliters</option>
          <option value="li">Liters</option>
        </select>
			</div>
		);
	}
}


export default Pantry;
