import React from 'react';
import { Link } from 'react-router-dom';

class Results extends React.Component {
  constructor(props) {
    super(props);
      this.state = {
        results: [],
        action: null,
        error: null,
      };

    this.getResults = this.getResults.bind(this);
    this.addFavorite = this.addFavorite.bind(this);
    //this.props.resetData.bind(this);
  }

  // runs only once when Results is created
  componentDidMount() {
    this.getResults();
  }
  
  // runs right before exiting Results, cancel in-progress fetches
  componentWillUnmount() {
  }

  componentDidUpdate(){
    if(this.props.update){
      this.props.resetData();
      this.getResults();
    }
  }

  getResults() {
    fetch(`http://localhost:8080/get-recipes/${this.props.userID}`, {
      method: "GET",
    })
    .then(async response => {
      let data = await response.json();
      if(!response.ok) {
        let err = data;
        return Promise.reject(err);
      }
      this.setState({
        results: data,
      });
    })
    .catch(err => {
      this.setState({
        error: "No recipes available.",
      });
    });
  }

  addFavorite(event, id) {
    event.preventDefault();
    fetch(`http://localhost:8080/favorites/${this.props.userID}/${id}`, {
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
      items = (this.state.results).map((item) => 
        <li className='Recipe' key={item.id}>
          <button className='AddRecipeButton' onClick={(event) => this.addFavorite(event, item.id)}>+</button>
          <button className='ViewRecipeButton'>
            <i class="arrow"></i>
          </button>
          <div className='RecipeTitle'>{item.title}</div>
          <div className='NutritionalInfo'>
            <li>Total Fat: {item.fat}</li>
            <li>Saturated Fat: {item.saturates}</li>
            <li>Sodium: {item.salt}</li>
            <li>Sugars: {item.sugars}</li>
          </div>
        </li>
      );
    }

    let msg = '';
    if (this.state.action) {
      msg = this.state.action;
    }

    return (
      <div>
        <h1 className='ResultsTitle'>Recipes</h1>
        <div> {items} </div>
        <div className='Message'>{msg}</div>
      </div>
    );
  }
}

export default Results;