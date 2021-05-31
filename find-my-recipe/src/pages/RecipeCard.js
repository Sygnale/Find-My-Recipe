import  React, { useState, useEffect } from 'react';
import './RecipeDisplay.css';

function RecipeCard(props) { // props.id - recipe id
                             // props.list - JSON w/ ingredient names
  const [recipe, setRecipe] = useState([]);
  const [list, setList] = useState([]);

  useEffect(() => {
    // GET recipe info
    fetch(`http://localhost:8080/recipes/${props.id}`, {
      method: "GET",
    })
    .then(async response => {
      let data = await response.json();
      console.log(data);
      setRecipe(data);
    });
  }, [props]);
  
  // once recipe is loaded
  useEffect(() => {
    if(recipe.length !== 0) {
      console.log(recipe);
      const { ingredients } = recipe;
      
      let arr = [];
      ingredients.map((item) => {
        let ing = props.list.filter((i) => i.id === item.ingredient_id);
        arr = [...arr, {
          name: ing[0].name,
          quantity: item.quantity,
          unit: item.unit,
        }];
      });
      setList(arr);
    }
  }, [recipe]);
  
  // once ingredients list is loaded
  useEffect(() => {
    if(list.length !== 0) {
      console.log(list);
    }
  }, [list]);
  
  const fatColor = `square ${recipe.fat}`;
  const saturateColor = `square ${recipe.saturates}`;
  const saltColor = `square ${recipe.salt}`;
  const sugarColor = `square ${recipe.sugars}`;
  
  const fatLabel = () => {
    let meaning;
    if(recipe.fat === "green")
      meaning = "< 3.0g/100g";
    else if(recipe.fat === "orange")
      meaning = "3.0g to 17.5g/100g";
    else if(recipe.fat === "red")
      meaning = "> 17.5g/100g";
    return (meaning);
  }
  
  const saturateLabel = () => {
    let meaning;
    if(recipe.saturates === "green")
      meaning = "< 1.5g/100g";
    else if(recipe.saturates === "orange")
      meaning = "1.5g to 5.0g/100g";
    else if(recipe.saturates === "red")
      meaning = "> 5.0g/100g";
    return (meaning);
  }
  
  const sugarLabel = () => {
    let meaning;
    if(recipe.sugars === "green")
      meaning = "< 5.0g/100g";
    else if(recipe.sugars === "orange")
      meaning = "5.0g to 22.5g/100g";
    else if(recipe.sugars === "red")
      meaning = "> 22.5g/100g";
    return (meaning);
  }
  
  const saltLabel = () => {
    let meaning;
    if(recipe.salt === "green")
      meaning = "< 0.3g/100g";
    else if(recipe.salt === "orange")
      meaning = "0.3g to 1.5g/100g";
    else if(recipe.salt === "red")
      meaning = "> 1.5g/100g";
    return (meaning);
  }

  let addFavorite = (event) => {
    event.preventDefault();
    fetch(`http://localhost:8080/favorites/${props.userID}/${props.id}`, {
      method: "POST",
    })
    .then(async response => {
      let data = await response.text();
      if(!response.ok) {
        let err = data;
        return Promise.reject(err);
      }
      alert('Favorite recipe added');
    })
    .catch(err => {
      alert(err);
    });
  }
  
  return(
    <div className='RecipeCard'>
      <h1>{recipe.title}</h1>
      <button className='AddButton' onClick={(event) => addFavorite(event)}>ADD</button>
      <div className='grid-container'>
        <div className='IngredientsList'>
          <h4>Ingredients:</h4>
          <div className='ScrollList'>
            <tbody className='IngredientsTable'>
              {list.map((item, index) => 
                <tr key={index}>
                  <td>[{item.quantity}&nbsp;{item.unit}]</td>
                  <td>&nbsp;{item.name}</td>
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
                {recipe.instructions.map((i, index) =>
                  <li> 
                    {index+1}. {i.instruction}
                  </li>
                )}
              </ol>
            }
          </div>
        </div>
      </div>
      <div className='CardFooter'>
        <div class='Nutrition'>
          <div><p class='NutritionLabel'>Nutritional Info:</p></div>
          <div class={fatColor}><p className='NutritionTypeLabel'>Fat</p></div>
          <div class="label-container">Fat: {fatLabel()}</div>
          <div class={saturateColor}><p className='NutritionTypeLabel'>Saturates</p></div>
          <div class="label-container">Saturate: {saturateLabel()}</div>
          <div class={sugarColor}><p className='NutritionTypeLabel'>Sugar</p></div>
          <div class="label-container">Sugar: {sugarLabel()}</div>
          <div class={saltColor}><p className='NutritionTypeLabel'>Salt</p></div>
          <div class="label-container">Salt: {saltLabel()}</div>
        </div>
        <div className='Buttons'>
          <a href={recipe.url}>
            <button className='SourceButton'>VIEW SOURCE</button>
          </a>
        </div>
      </div>
    </div>
  );
}

export default RecipeCard;