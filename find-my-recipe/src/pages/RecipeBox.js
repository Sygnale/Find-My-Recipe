import  React, { useState, useEffect } from 'react';
import RecipeCard from './RecipeCard';

function RecipeBox() {
	const [recipes, setRecipes] = useState([]);
	const [index, setIndex] = useState(0);
	const [boundError, setBoundError] = useState(null);
	const recipeIDs = [5, 7, 11, 12, 13, 18, 23, 24, 34, 50];
	
	useEffect(() => {
		let arr = [];
		recipeIDs.map((id) => {
			fetch(`http://localhost:8080/recipes/${id}`, {
				method: "GET",
			})
			.then(async response => {
				let data = await response.json();
				arr = [...arr, data];
				if(arr.length === recipeIDs.length) {
					setRecipes(arr);
				}
			});
		});
	}, []);
	
	useEffect(() => {
		if(recipes.length !== 0) {
			
		}
	}, [recipes]);
	
	useEffect(() => {
		console.log(recipes[index]);
	}, [index]);
	
	
	const clickNext = (e) => {
		e.preventDefault();
		if(index < recipeIDs.length - 1) {
			setIndex(index + 1);
			setBoundError(null);
		}
		else
			setBoundError('End of recipes');
	}
	
	const clickPrev = (e) => {
		e.preventDefault();
		if(index > 0) {
			setIndex(index - 1);
			setBoundError(null);
		}
		else
			setBoundError('Beginning of recipes');
	}
	
	return (
		<div className='RecipeBox'>
			<button className='PrevRecipe' onClick={(event) => clickPrev(event)}>
				&lt;
			</button>
			<button className='NextRecipe' onClick={(event) => clickNext(event)}>
				&gt;
			</button> {index} {boundError}
			{recipes.length === 0 ? '' : 
				<RecipeCard recipe={recipes[index]}/>
			} 
		</div>
	);
}

export default RecipeBox;