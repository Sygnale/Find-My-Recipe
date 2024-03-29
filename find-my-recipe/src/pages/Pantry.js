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
        selectedRecipe: -1,
      };
    this.getPantry = this.getPantry.bind(this);
    this.addIngredientAmount = this.addIngredientAmount.bind(this);
    this.removeIngredient = this.removeIngredient.bind(this);
    this.emptyPantry = this.emptyPantry.bind(this);
    this.managePantry = this.managePantry.bind(this);
  }

  // runs only once when Pantry is created
  componentDidMount() {
    this.getIngredients();
    this.getPantry();
  }

  // runs every time listed props are updated
  componentDidUpdate(pantryChanged) {
    if(this.state.pantryChanged) {
      this.getPantry();
      this.setState({ pantryChanged: false });
    }
  }
  
  // load possible ingredients in database
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
  
  // load user's pantry items
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
      let select=document.getElementById('RecipeSelector');

      while(select.options.length){
        select.remove(0);
      }
      data.ingredients.forEach(option =>
        select.options.add(new Option(option.name, option.id))
      );

      if(data.ingredients.length !== 0){
        this.setState({
          selectedRecipe: data.ingredients[0].id,
        });
      }
    })
    .catch(err => {
      this.setState({
        pantry: [],
        error: "Your pantry is empty. Search to add ingredients.",
      });
    });
  }

  addIngredientAmount(id, Converted) {
    fetch(`http://localhost:8080/${this.props.userID}/ingredients/${id}/${Converted}`, {
      method: "POST",
    })
    .then(async response => {
      let data = await response.text();
    if(!response.ok) {
      let err = data;
      return Promise.reject(err);
    }
    this.setState({
      action: 'Ingredient amount updated',
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
  
  // eliminate selected ingredient from user's pantry
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
  
  // removes all items from user's pantry
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
  
  // methods to add/remove ingredients (1=add, -1=remove)
  managePantry(act, id) {
    switch(act) {
      case 1:
        let Converted = this.amountConversion();
        this.addIngredientAmount(id, Converted);
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
        return (this.state.amount / 35.274);

      case "pound":
        return (this.state.amount / 2.205);

      case "gram":
        return (this.state.amount / 1000);

      case "teas":
        return (this.state.amount / 203);

      case "table":
        return (this.state.amount / 67.628);

      case "fl-oz":
        return (this.state.amount / 33.814);

      case "cup":
        return (this.state.amount / 4.167);

      case "pint":
        return (this.state.amount / 2.113);

      case "quart":
        return (this.state.amount / 1.057);

      case "gallon":
        return (this.state.amount / 3.785);

      case "bushel":
       return (this.state.amount * 35.239);

      case "ml":
        return (this.state.amount / 1000);

      default:
        return this.state.amount;
    }
  }

  handleUnitChange = (event) => {
    this.setState({unit: event.target.value});
  }

  handleRecipeChange = (event) => {
    this.setState({selectedRecipe: event.target.value});
  }

  handleAmountChange = (event)=> {
    let preAmount = parseFloat(event.target.value);

    if (preAmount < 0)
        preAmount=0;

    this.setState({amount: preAmount});
  }

  updateIngredientAmount = (event) => {
    this.managePantry(1,this.state.selectedRecipe);
  }

  render() {
    const { error } = this.state;
    let items = (this.state.pantry).map((item) =>
      <li className='List' key={item.id}>
        <button className='RemoveButton' onClick={(event) => {
          event.preventDefault();
          this.managePantry(-1, item.id);
        }}>-</button>
        {item.name} {`(${item.amount})`}
      </li>
    );

    let msg = '';
    if (this.state.action) {
      msg = this.state.action;
    }

    return (
      <div className='Pantry'>
        <h1 className='PantryTitle'>Pantry</h1>
        <Search className='SearchBar' pantry={this.state.pantry} list={this.state.ingredients} managePantry={this.managePantry}/>
        <p className='UnitText'>All displayed ingredient amounts are in the corresponding SI units</p>
        <div className='Items'><div className='ErrorText'>{error}</div> {items} </div>
        <div className='AddIngredients'>
          <p className='UpdateHeader'>Update Ingredient Amount: </p>
          <input type='number' className="amountInput" value={this.state.amount} onChange={this.handleAmountChange} min="0" />
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
            <select selectToEdit={this.state.selectedRecipe} className='RecipeSelector' id='RecipeSelector' onChange={this.handleRecipeChange}></select>
            <button className='UpdateButton' onClick={this.updateIngredientAmount}>UPDATE AMOUNT</button>
          </div>
        <div>
          <button className='EmptyButton' onClick={this.emptyPantry}>EMPTY PANTRY</button>
        </div>
        <div className='message' >{msg}</div>
      </div>
    );
  }
}

export default Pantry;