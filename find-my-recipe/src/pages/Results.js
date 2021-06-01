import React from 'react';
import gif from '../assets/bowl_mixing.gif';
import { Link } from 'react-router-dom';

class Results extends React.Component {
  constructor(props) {
    super(props);
      this.state = {
        results: [],
        action: null,
        error: null,
				isLoaded: false,
      };

    this.getResults = this.getResults.bind(this);
    this.addFavorite = this.addFavorite.bind(this);
    //this.props.resetData.bind(this);
  }

  // runs only once when Results is created
  componentDidMount() {
    this.getResults();
  }

  componentDidUpdate(){
    if(this.props.update){
      this.props.resetData();
			this.setState({ isLoaded: false, });
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
				isLoaded: true,
      });
      let arr = data.map((i) => i.id);
      this.props.initDisplay(arr);
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
      items = (this.state.results).map((item, index) => 
        <li className='Recipe' key={item.id}>
          <button className='AddRecipeButton' onClick={(event) => this.addFavorite(event, item.id)}>+</button>
          <button className='ViewRecipeButton' onClick={(event) => {
            event.preventDefault();
            this.props.openOn(index);
            this.props.toggleDisplay();
            }}>
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
        <div>
				{this.state.isLoaded ? items : <img src={gif} alt="gif"/>}
				</div>
        <div className='Message'>{msg}</div>
      </div>
    );
  }
}

export default Results;