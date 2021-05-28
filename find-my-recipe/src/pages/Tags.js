import React from 'react';
import Results from './Results'
import { Link } from 'react-router-dom';

const tagsOpt = [

"low fat",
"low salt",
"low sugar",
"vegetarian",
"gluten free",

];

const Checkbox = ({ label, isSelected, onCheckboxChange }) => (
  <div className="form-check">
    <input
        type="checkbox"
        name={label}
        checked={isSelected}
        onChange={onCheckboxChange}
        className="form-check-input"
      />
    <label className='OptionLabel'>
      {label}
    </label>
  </div>
);

class Tags extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: [],
      tagsChanged: false,
      action: null,
      query: null,
      error: null,
      input:'',
      checkboxes: tagsOpt.reduce((tags, tag) => ({...tags, [tag]: false}), {} ),
    };

    this.addTag = this.addTag.bind(this);
    this.removeTag = this.removeTag.bind(this);
    this.getTags = this.getTags.bind(this);
}

  componentDidMount() {
    this.emptyTags();
    this.getTags();
    console.log(this.state.tags);
  }

  // runs everytime listed props are updated
  componentDidUpdate(tagsChanged) {
    if(this.state.tagsChanged) {
      this.getTags();
      console.log(this.state.tags);
      this.setState({ tagsChanged: false });
    }
  }

  addTag(tag) {
  fetch(`http://localhost:8080/${this.props.userID}/tags/${tag}`, {
    method: "POST",
  })
  .then(async response => {
    let data = await response.text();
  if(!response.ok) {
    let err = data;
    return Promise.reject(err);
  }
  this.setState({
    action: 'Tag added',
    error: null,
    tagsChanged: true,
  });
  })
  .catch(err => {
    this.setState({
      error: err,
    });
  });

  console.log(typeof this.state.tags);

  }

  removeTag(tag) {
    fetch(`http://localhost:8080/${this.props.userID}/tags/${tag}`, {
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
        tagChanged: true,
      });

    console.log(this.state.tags);

    })

    .catch(err => {
      this.setState({
        error: err,
      });
    });
  }


  getTags() {
  		fetch(`http://localhost:8080/${this.props.userID}/tags`, {
  			method: "GET",
  		})
  		.then(async response => {
  			let data = await response.json();
  			if(!response.ok) {
  				let err = data;
  				return Promise.reject(err);
  			}

  			this.setState({tags: data.tags });

  			console.log(data);

  	   })

  		.catch(err => {
  			this.setState({
  				tags: [],
  				error: "You have no tags.",
  			});
  		});
  	}

    emptyTags() {

      fetch(`http://localhost:8080/${this.props.userID}/tags`, {
        method: "DELETE",
      })
      .then(async response => {
        let data = await response.json();
        if(!response.ok) {
          let err = data;
          return Promise.reject(err);
        }

        this.setState({tags: data.tags });

        console.log(data);

       })

      .catch(err => {
        this.setState({
          tags: [],
          error: "You have no tags.",
        });
      });

    }

    handleCheckboxChange = changeEvent => {
      const { name } = changeEvent.target;

      this.setState(prevState => ({
        checkboxes: {
          ...prevState.checkboxes,
          [name]: !prevState.checkboxes[name]
        }
      }));

      if (this.state.checkboxes[name])
        this.removeTag(name);

      else {
        this.addTag(name);
      }

    };

    handleFormSubmit = formSubmitEvent => {
      formSubmitEvent.preventDefault();

      Object.keys(this.state.checkboxes)
        .filter(checkbox => this.state.checkboxes[checkbox])
        .forEach(checkbox => {
          console.log(checkbox, "is selected.");
        });
    };

    createCheckbox = option => (
      <Checkbox
        label={option}
        isSelected={this.state.checkboxes[option]}
        onCheckboxChange={this.handleCheckboxChange}
        key={option}
      />
    );

    createCheckboxes = () => tagsOpt.map(this.createCheckbox);

  render() {

    const { error } = this.state;

    let msg = '';
    if (this.state.action) {
      msg = this.state.action;
    }

    return (
      <div className='TagsTitle'>
        <h1>Search</h1>
        <form className='Checkboxes' onSubmit={this.handleFormSubmit}>
          {this.createCheckboxes()}
        </form>
        <button className="searchAgain" onClick={(event) => this.getResults}>FILTER RECIPES</button>
        <div>
        {msg} {error}
        </div>
      </div>
    );
  }
}

export default Tags;
