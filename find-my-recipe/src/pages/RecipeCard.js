import  React, { useState, useEffect } from 'react';

function RecipeCard() { // props.recipe - JSON w/ recipe info
	const [recipe, setRecipe] = useState([]);
	const [list, setList] = useState([]);
	
	useEffect(() => {
		// GET example recipe
		fetch(`http://localhost:8080/recipes/11`, {
			method: "GET",
		})
		.then(async response => {
			let data = await response.json();
			console.log(data);
			setRecipe(data);
		});
		
	// empty dependency array means this effect will only run once (like componentDidMount in classes)
	}, []);
	
	// once recipe is loaded
	useEffect(() => {
		if(recipe.length !== 0) {
			const { ingredients} = recipe;
		
			//load ingredients database
			fetch(`http://localhost:8080/ingredients`, {
					method: "GET",
			})
			.then(async response => {
				let data = await response.json();			
				let arr = [];
				ingredients.map((item) => {
					let ing = data.filter((i) => i.id === item.ingredient_id);
					arr = [...arr, {
						name: ing[0].name,
						quantity: item.quantity,
						unit: item.unit,
					}];
				});
				setList(arr);
			});
		}
	}, [recipe]);
	
	// once ingredients list is loaded
	useEffect(() => {
		if(list.length !== 0) {
			console.log(list);
		}
	}, [list]);
	
	return(
		<div className='RecipeCard'>
			<h1>{recipe.title}</h1>
			<table className='NutInfo'>
				<thead>
					<tr>
						<th>Fat</th>
						<th>Saturate</th>
						<th>Sugar</th>
						<th>Salt</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>{recipe.fat}</td>
						<td>{recipe.saturates}</td>
						<td>{recipe.sugars}</td>
						<td>{recipe.salt}</td>
					</tr>
				</tbody>
			</table>
			<div className='IngredientsList'>
				What you need:
				<ul>
					{list.map((item, index) => 
						<li key={index}> 
							{item.name} ({item.quantity} {item.unit})
						</li>
					)}
				</ul>
			</div>
			<div className='Instructions'>
				Instructions:
				{recipe.length === 0 ? '' : 
					<ol>
						{recipe.instructions.map((i) =>
							<li key={i.step_number}> 
								{i.instruction}
							</li>
						)}
					</ol>
				}
			</div>
			<div className='URL'>
				<a href={recipe.url}>The Sauce</a>
			</div>
		</div>
	);
}

export default RecipeCard;