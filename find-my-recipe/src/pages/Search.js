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
	/*
	const data = [
		{id: 1, name: 'abc'},
		{id: 2, name: 'bcd'},
		{id: 3, name: 'cde'}
	];
	*/
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
		/*
		if (getMatch(s, data))
			setSearching("Searching in ingredients database...");
		else {
			setSearching("¯\\_(⊙︿⊙)_/¯ not found");
			setResults([]);
		}
		*/
		
		if(getMatch(s, props.pantry)) {
			setSearching("Searching in ingredients database...");
			
		}
		else if(getMatch(s, props.list))
			setSearching("Searching in your pantry...");
		else {
			setSearching("¯\\_(⊙︿⊙)_/¯ not found");
			setResults([]);
		}
		
  }
	
	const handleClick = (e, n) => {
		e.preventDefault();
		props.addIngredient(n);
	}
	
	return (
		<div>
			<form>
				<label>
					<input
						type="text"
						placeholder="Search or add ingredients"
						value={query}
						onChange={handleSearch}
					/>
					{searching}
					<ul>
						{results.map(item => (
							<li key={item.id}>
								{item.name}
								<button onClick={(event) => handleClick(event, item.id)}>+</button>
							</li>
						))}
					</ul>
				</label>
			</form>
		</div>
	);
}

export default Search;