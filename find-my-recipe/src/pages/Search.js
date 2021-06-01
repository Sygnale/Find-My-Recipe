import { React, useState, useEffect } from 'react';

function Search(props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState('');
  
	// stop ingredients search when no input given
  useEffect(() => {
    if(query === '') {
      setSearching('');
    }
  }, [query]);
  
	// filters query against entire ingredients database
  const getMatch = (q, allData) => {
    if(allData.length === 0 || q === '')
      return false;
    let a = allData.filter((i) => {
      return (i.name.toLowerCase()).includes(q.toLowerCase());
    });
    if (a.length === 0)
      return false;
    setResults(a);
    return true;
  }
  
	// handles ingredients search when user inputs query
  const handleSearch = (e) => {
    e.preventDefault();
    let s = e.target.value;
    setQuery(s);
    
    if(getMatch(s, props.list))
      setSearching("Searching...");
    else {
      setSearching("¯\\_(⊙︿⊙)_/¯ not found");
      setResults([]);
    }   
  }
  
	// adds selected ingredients to pantry
  const handleClick = (e, n) => {
    e.preventDefault();
    props.managePantry(1, n); // add ingredient to pantry
    setQuery('');
    setResults([]);
  }

  return (
    <div>
      <form onSubmit={e => { e.preventDefault(); }}>
        <label className='SearchContainer'>
          <input className='SearchBar'
            type="text"
            placeholder="Search or add ingredients"
            value={query}
            onChange={handleSearch}
          />
          <div className='SearchText'>{searching}</div>
          <ul className='SearchResults'>
            {results.map(item => (
              <li key={item.id}>
                <button className='RemoveButton' onClick={(event) => handleClick(event, item.id)}>+</button>
                {item.name}
              </li>
            ))}
          </ul>
        </label>
      </form>
    </div>
  );
}

export default Search;