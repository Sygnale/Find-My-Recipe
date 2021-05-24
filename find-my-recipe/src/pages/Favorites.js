import React from 'react';
import { Link } from 'react-router-dom';
// import Recipes from './Recipes';

class Favorites extends React.Component {
  constructor(props) {
    super(props);
      this.state = {
        favorites: [],
        favoritesChanged: false,
        action: null,
        error: null,
      }

    this.getFavorites = this.getFavorites.bind(this);
    this.removeFavorite = this.removeFavorite.bind(this);
  }

  // runs only once when Favorites is created
  componentDidMount() {
    this.getFavorites();
  }
  
  // runs everytime listed props are updated
  componentDidUpdate() {
    if(this.state.favoritesChanged) {
      this.getFavorites();
      this.setState({ favoritesChanged: false, });
    }
  }
  
  // runs right before exiting Favorites, cancel in-progress fetches
  componentWillUnmount() {
  }

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
      });
    })
    .catch(err => {
      this.setState({
        error: "No favorited recipes.",
      });
    });
  }

  removeFavorite(event, id) {
    event.preventDefault();
    fetch(`http://localhost:8080/favorites/${this.props.userID}/${id}`, {
      method: "DELETE",
    })
    .then(async response => {
      let data = await response.json();
      if(!response.ok) {
        let err = data;
        return Promise.reject(err);
      }
      this.setState({
        action: data,
        favoritesChanged: true,
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
      items = (this.state.favorites).map((item) => 
        <li key={item.id}>
          (${item.title})`
          <button onClick={(event) => this.removeFavorite(event, item.id)}>+</button>
          <div>
            <li>Total Fat `(${item.fat})`</li>
            <li>Saturated Fat `(${item.saturates})`</li>
            <li>Sodium `(${item.salt})`</li>
            <li>Sugars `(${item.sugars})`</li>
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
        <h1>Recipes</h1>
        <button>
          <Link to='\Recipes'>Find more recipes</Link>
        </button>
        <div> {items} </div>
        {msg}
      </div>
    );
  }
}

export default Favorites;