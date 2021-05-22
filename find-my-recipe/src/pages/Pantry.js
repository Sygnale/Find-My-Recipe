import React from 'react';
import { Link } from 'react-router-dom';

class Pantry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pantry: [],
      ingredients: [],
      search: null,
      error: null,
      isLoaded: false,
    };

  this.handleSearch = this.handleSearch.bind(this);
  this.handleRemove = this.handleRemove.bind(this);
  this.handleEmpty = this.handleEmpty.bind(this);
}

getPantry() {
  fetch(`http://localhost:8080/${this.props.userID}/ingredients`, {
    method: "GET",
  })
  .then(async response => {
    let data = await response.json();
    if(!response.ok) {
      let err = data;
      return Promise.reject(err);
    }
    this.setState({
      isLoaded: true,
      pantry: data,
    });
    this.props.handleStateChange(this.state.response);
  })
  .catch(err => {
    this.setState({
      isLoaded: true,
      error: "Your pantry is empty. Search to add ingredients.",
    });
  });
}

getIngredients() {
  fetch(`http://localhost:8080/ingredients`, {
      method: "GET",
  })
  .then(async response => {
    let data = await response.json();
    if(!response.ok) {
      let err = data;
      return Promise.reject(err);
    }
    this.setState({
      isLoaded: true,
      ingredients: data,
    });
    this.props.handleStateChange(this.state.response);
  });
}

handleSearch(event) {
  this.setState({ search: event.target.value });
}

handleRemove(id) {
  fetch(`http://localhost:8080/${this.props.userID}/ingredients/${id}`, {
    method: "DELETE",
  });
}

handleEmpty(event) {
  if (confirm("Are you sure you want to empty your pantry?")) {
    fetch(`http://localhost:8080/${this.props.userID}ingredients`, {
      method: "DELETE",
    });
  }
}

render() {
  getPantry();

  const { error, isLoaded } = this.state;
  let items;
  if (error) {
    items = error;
  }
  else if (!isLoaded) {
    items = "Loading...";
  }
  else {
    items = pantry.filter((data) => {
      if (!this.state.search) {
        return data;
      }
      else if (data.name.toLowerCase().includes(this.state.search.toLowerCase())) {
        return data;
      }
    }).map(data => {
      return (
        <div>
          <p> {data.name} {data.amount}
            <button onClick={this.handleRemove(data.id)}>Remove</button>
          </p>
        </div>
      );
    });
  }

  return (
    <div>
      <h1>Pantry</h1>
      <form>
        <label>
          <input
            name="search"
            type="text"
            value={this.state.search}
            placeholder="Search or add ingredients"
            onChange={this.handleSearch} />
        </label>
      </form>
       <div> {items} </div>
      <div>
        <button onClick={this.handleEmpty}>Empty pantry</button>
      </div>
    </div>
  );
}
}

export default Pantry;
