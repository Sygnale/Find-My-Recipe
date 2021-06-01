import  React, { useState, useEffect } from 'react';
import RecipeCard from './RecipeCard';
import './RecipeDisplay.css';

//props.recipes - list of recipe ids to display
//props.index - index of recipe to first display

function RecipeBox(props) {
  const [recipes, setRecipes] = useState(props.recipes);
  const [list, setList] = useState([]);
  const [index, setIndex] = useState(props.index);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [reachedBeg, setReachedBeg] = useState(false);  
  const [isLoaded, setLoading] = useState(false);  
  
	// load ingredients database
  useEffect(() => {    
    fetch(`http://localhost:8080/ingredients`, {
        method: "GET",
    })
    .then(async response => {
      let data = await response.json(); 
      setList(data);
    });
  }, []);
  
  // prevent access to states when they're still loading
  useEffect(() => {
    setLoading(recipes.length !== 0 && list.length !== 0);
  }, [recipes, list]);
  
	// check for bound error
  useEffect(() => {
    setReachedEnd(index === recipes.length - 1);
    setReachedBeg(index === 0);
  }, [index]);
  
	// change to next recipe (unless already at last recipe)
  const clickNext = (e) => {
    e.preventDefault();
    if(reachedEnd === false)
      setIndex(index + 1);
  }
  
	// change to previous recipe (unless already at first recipe)
  const clickPrev = (e) => {
    e.preventDefault();
    if(reachedBeg === false)
      setIndex(index - 1);
  }
  
	// only create recipe card once states are updated
  const card = isLoaded && <RecipeCard id={recipes[index]} list={list} userID={props.userID}/>;
  
	// only displays arrow buttons when there're more recipes to show
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