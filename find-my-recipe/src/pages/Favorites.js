import React from 'react';
import { Link } from 'react-router-dom';

class Favorites extends React.Component {
  constructor(props) {
    super(props);
      this.state = {
        favorites: [],
        favoritesChanged: false,
        action: null,
        error: null,
      };

    this.getFavorites = this.getFavorites.bind(this);
    this.removeFavorite = this.removeFavorite.bind(this);
  }

  // runs only once when Favorites is created
  componentDidMount() {
    this.getFavorites();
  }
  
  // runs every time listed props are updated
  componentDidUpdate() {
    if(this.state.favoritesChanged) {
      this.getFavorites();
      this.setState({ favoritesChanged: false, });
    }
  }

  // load user's favorite recipes
  getFavorites() {
    fetch(`http://localhost:8080/favorites/${this.props.userID}`, {
      method: "GET",
    })
    .then(async response => {
      let data = await response.json();
      if(!response.ok) {
        let err = data;
        return Promise.reject(err);
      }
      this.setState({
        favorites: data,
        error: null,
      });
      let arr = data.map((i) => i.recipe_id);
      this.props.initDisplay(arr);
    })
    .catch(err => {
      this.setState({
        favorites: [],
        error: "No favorited recipes.",
      });
    });
  }

  // remove recipe from user's favorites
  removeFavorite(event, id) {
    event.preventDefault();
    fetch(`http://localhost:8080/favorites/${this.props.userID}/${id}`, {
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
        favoritesChanged: true,
        error: null,
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
      items = (this.state.favorites).map((item, index) => 
        <li className='FavRecipe' key={item.recipe_id}>
          <button className='RemoveRecipeButton' onClick={(event) => this.removeFavorite(event, item.recipe_id)}>x</button>
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
      <div className='Favorites'>
        <h1 className='FavRecipeTitle'>Favorite Recipes</h1>
        <Link to='/Recipes'>
          <button className='MoreButton'>FIND MORE RECIPES</button>
        </Link>
        <div> {items} </div>
        <div className='Message'>{msg}</div>
      </div>
    );
  }
}

export default Favorites;