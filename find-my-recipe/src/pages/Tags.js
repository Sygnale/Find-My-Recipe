import React from 'react';
import { Link } from 'react-router-dom';

class Tags extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: [],
      tagsChanged: false,
      action: null,
      query: null,
      error: null,
    };
  }

  render() {
    return (
      <div className='Tags'>
        <h1 className='TagsTitle'>Search</h1>
      </div>
    );
  }
}

export default Tags;