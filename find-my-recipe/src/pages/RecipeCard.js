import  React, { useState, useEffect } from 'react';
import './RecipeDisplay.css';

function RecipeCard(props) { // props.recipe - JSON w/ recipe info
	//const [recipe, setRecipe] = useState([]);
	const [recipe, setRecipe] = useState(props.recipe);
	const [list, setList] = useState([]);
	
	{/*
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
	*/}
	
	useEffect(() => {
		console.log(recipe);
	}, []);
	
	useEffect(() => {
		setRecipe(props.recipe);
	}, [props]);
	
	// once recipe is loaded
	useEffect(() => {
		if(recipe.length !== 0) {
			const { ingredients } = recipe;
		
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
			<div className='grid-container'>
				<div className='IngredientsList'>
					<h4>Ingredients:</h4>
					<div className='ScrollList'>
						<tbody className='IngredientsTable'>
							{list.map((item, index) => 
								<tr>
									<td>[{item.quantity} {item.unit}]</td>
									<td>{item.name}</td>
								</tr>
							)}
						</tbody>
					</div>
				</div>
				<div className='Instructions'>
					<h4>Instructions:</h4>
					<div className='ScrollList'>
						
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
				</div>
			</div>
			<div className='CardFooter'>
				<div class="square green"></div>
				<div class="square orange"></div>
				<div class="square red"></div>
				<div>
					<button className='SelectRecipe'>
						I wanna make this!
					</button>
				</div>
				<div className='URL'>
					<a href={recipe.url}>The Sauce</a>
				</div>
			</div>
		</div>
	);
}

export default RecipeCard;