import { React, useState, useEffect } from 'react';

function Search(props) {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState([]);
	const [searching, setSearching] = useState('');
	
	useEffect(() => {
		if(query === '') {
			setSearching('');
		}
	}, [query]);
	
	const getMatch = (q, allData) => {
		//alert(JSON.stringify(allData));
		if(allData.length === 0 || q === '')
			return false;
		let a = allData.filter((i) => {
			return i.name.includes(q);
		});
		if (a.length === 0)
			return false;
		setResults(a);
		return true;
	}
	
	const handleSearch = (e) => {
		e.preventDefault();
		let s = e.target.value.toLowerCase();
		setQuery(s);
		
		if(getMatch(s, props.pantry)) {
			setSearching("Searching in your pantry...");
		}
		else if(getMatch(s, props.list))
			setSearching("Searching in ingredients database...");
		else {
			setSearching("¯\\_(⊙︿⊙)_/¯ not found");
			setResults([]);
		}
		
  }
	
	const handleClick = (e, n) => {
		e.preventDefault();
		props.managePantry(1, n);
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
					<ul>
						{results.map(item => (
							<li key={item.id}>
								<button className='RemoveButton' onClick={(event) => handleClick(event, item.id)}>+</button>
								{item.name};
							</li>
						))}
					</ul>
				</label>
			</form>
		</div>
	);
}

export default Search;