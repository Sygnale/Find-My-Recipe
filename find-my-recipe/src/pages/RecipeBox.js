import  React, { useState, useEffect } from 'react';
import RecipeCard from './RecipeCard';
import './RecipeDisplay.css';

function RecipeBox(props) { //props.recipes - list of recipe ids to display
														//props.index - index of recipe to first display
	//const [recipes, setRecipes] = useState([]);
	const [recipes, setRecipes] = useState(props.recipes);
	const [list, setList] = useState([]);
	const [index, setIndex] = useState(props.index);
	const [boundError, setBoundError] = useState(null);
	const [reachedEnd, setReachedEnd] = useState(false);
	const [reachedBeg, setReachedBeg] = useState(false);	
	const [isLoading, setLoading] = useState(true);
	//const recipeIDs = [5, 7, 11, 12, 13, 18, 23, 24, 34, 50];
	
	
	useEffect(() => {
		{/*
		let arr = [];
		recipeIDs.map((id) => {
			fetch(`http://localhost:8080/recipes/${id}`, {
				method: "GET",
			})
			.then(async response => {
				let data = await response.json();
				console.log(data);
				arr = [...arr, data];
				if(arr.length === recipeIDs.length) {
					setRecipes(arr);
				}
			});
		});
		*/}
		
		//load ingredients database
		fetch(`http://localhost:8080/ingredients`, {
				method: "GET",
		})
		.then(async response => {
			let data = await response.json();	
			setList(data);
		});
	}, []);
	
	
	useEffect(() => {
		console.log(recipes);
		setLoading(recipes.length !== 0 && list.length !== 0);
	}, [recipes, list]);
	
	useEffect(() => {
		console.log(index);
		console.log(reachedBeg);
		console.log(reachedEnd);
	}, [reachedBeg, reachedEnd]);
	
	useEffect(() => {
		setReachedEnd(index === recipes.length - 1);
		setReachedBeg(index === 0);
	}, [index]);
	
	
	const clickNext = (e) => {
		e.preventDefault();
		if(reachedEnd === false)
			setIndex(index + 1);
	}
	
	const clickPrev = (e) => {
		e.preventDefault();
		if(reachedBeg === false)
			setIndex(index - 1);
	}
	
	const swipeButtons = () => {
		if(reachedEnd === false) {
			<button className='PrevRecipe' onClick={(event) => clickPrev(event)}>
				&lt;
			</button>
		}
		if(reachedBeg === false) {
			<button className='NextRecipe' onClick={(event) => clickNext(event)}>
				&gt;
			</button>
		}
	};
	
	const card = isLoading && <RecipeCard id={recipes[index]} list={list}/>;
	
	const nextButton = (reachedEnd === false) && <button className='NextRecipe' onClick={(event) => clickNext(event)}>
				&gt;
			</button>;
			
	const prevButton = (reachedBeg === false) && <button className='PrevRecipe' onClick={(event) => clickPrev(event)}>
				&lt;
			</button>;
	
	return (
		<div className='RecipeBox'>
			<button className="close-icon" onClick={props.handleClose}>x</button>
			{nextButton}
			{prevButton}
			{card}
		</div>
	);
}

export default RecipeBox;