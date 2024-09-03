import React, { useEffect, useState } from "react";
import Image from 'next/image';
import styles from '../styles/cooking.module.css';

export default function Cooking() {
  const [username, setUsername] = useState('MonkyMars');
  const [input, setInput] = useState('');
  const [selectedOption, setSelectedOption] = useState('null');
  const [recipeClicked, setRecipeClicked] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [recipeTitle, setRecipeTitle] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [recipeImage, setRecipeImage] = useState('');
  const [recipeInstructions, setRecipeInstructions] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [optionMenu, setOptionMenu] = useState(false);
  const [randomRecipes, setRandomRecipes] = useState([]);

  useEffect(() => {
    if (input === null) setRecipes([]);
  }, [input]);

  useEffect(() => {
    if(selectedOption === 'ByIngredients') {
      setPlaceholder('Enter ingredients seperated by a comma');
    } else if(selectedOption === ('ByRecipeName')){
      setPlaceholder('Enter recipe name')
    } else {
      setPlaceholder("What's cookin'?")
    }
  }, [selectedOption]);

  useEffect(() => {
    const fetchRandomRecipes = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_API_KEY;

        const randomResponse = await fetch(`https://api.spoonacular.com/recipes/random?number=10&apiKey=${apiKey}`);
        const randomData = await randomResponse.json();
        const randomRecipes = randomData.recipes;

        const detailedRecipes = await Promise.all(
          randomRecipes.map(async (recipe) => {
            const detailsResponse = await fetch(`https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${apiKey}`);
            const detailsData = await detailsResponse.json();
            return detailsData;
          })
        );

        detailedRecipes.sort((a, b) => b.likes - a.likes);

        setRandomRecipes(detailedRecipes);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRandomRecipes();
  }, []);

  const fetchRecipe = async () => {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const query = encodeURIComponent(input);
    
    try {
      let response;
  
      if (selectedOption === 'ByIngredients') {
        response = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${query}&apiKey=${apiKey}`);
      } else if(selectedOption === 'ByRecipeName') {
        response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${apiKey}`);
      } else{
        window.alert('Please select an option');
      }
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      const recipesData = selectedOption === 'ByIngredients' ? data : data.results;
  
      const detailedRecipes = await Promise.all(
        recipesData.map(async (recipe) => {
          const detailsResponse = await fetch(`https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${apiKey}`);
          if (!detailsResponse.ok) {
            throw new Error('Network response was not ok');
          }
          return await detailsResponse.json();
        })
      );
  
      setRecipes(detailedRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };
  

  const toggleRecipe = (title, ingredients, image, instructions) => {
    setRecipeTitle(title);
    setRecipeIngredients(ingredients);
    setRecipeImage(image);
    setRecipeInstructions(instructions);
    setRecipeClicked(true);
  };
  const toggleOption = (e) => {
    setSelectedOption(e.target.value);
  }
  const resetRecipes = () => {
    setRecipes([]);
    setRecipeClicked(false);
  }

  const toggleRandomRecipe = () => {
    
  }
  return (
    <>
      <main>
        <nav className={styles.Nav}>
          <div className={styles.Title}>
            <h1 onClick={resetRecipes}>What's Cookin'</h1>
            <Image alt='chef' src={'/icons/chef.webp'} width={60} height={60} draggable={false} priority />
          </div>

           <div className={styles.Profile} onClick={() => setOptionMenu(!optionMenu)}>
            <Image src={''} alt='profile' width={100} height={100} />
            <label>{username}</label>
          </div> 
        </nav>

        <div className={styles.optionMenu} style={{opacity: optionMenu ? '1' : '0'}}> 
          <div>
            <label>History</label>
          </div>
          <div>
            <label>Settings</label>
          </div>
          <div>
            <label>Sign out</label>
          </div>
        </div>

        <div className={styles.InputPage} style={{top: recipeTitle === '' ? '30%' : '75px'}}>
          <select onClick={toggleOption}>
            <option value={'null'}></option>
            <option value={'ByIngredients'}>By ingredients</option>
            <option value={'ByRecipeName'}>By recipe name</option>
          </select>
          <input
            type="text"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          {input.length > 0 && (
            <button onClick={fetchRecipe}>{'>'}</button>
          )}
        </div>
      </main>

      <main className={styles.Recipes}>
        {recipes.map((recipe, key) => (
          <RecipeCard 
            key={key} 
            title={recipe.title} 
            image={recipe.image}
            handleClick={() => toggleRecipe(
              recipe.title, 
              recipe.extendedIngredients, 
              recipe.image, 
              recipe.instructions.toLowerCase() || 'No instructions available'
            )}
          />
        ))}
      </main>

      {recipeClicked && recipeTitle !== '' && (
        <Recipe 
          title={recipeTitle} 
          ingredients={recipeIngredients} 
          image={recipeImage}
          instructions={recipeInstructions}
        />
      )}
      {!recipeClicked && recipes.length === 0 && (
        <Homepage randomRecipes={randomRecipes} toggleRandomRecipe={toggleRandomRecipe}/>
      )}
    </>
  );
}

export const RecipeCard = ({ title, image, handleClick }) => {
  return (
    <div className={styles.RecipeCard} onClick={handleClick}>
      <header>
        <h2>{title}</h2>
      </header>
      <Image src={image} alt={title} width={400} height={400} />
    </div>
  );
};

export const Recipe = ({ title, ingredients, image, instructions }) => {
  const removeHtmlTags = (text) => {
    return text.replace(/<\/?[^>]+(>|$)/g, "");
  };

  return (
    <section className={styles.Recipe}>
      <div>
        <h2>{title}</h2>
      </div>
      <div className={styles.Info}>
        <ul>
          {ingredients && ingredients.map((ingredient, key) => (
            <li key={key}>
              {Math.round(ingredient.amount * 10) / 10} {ingredient.unit} {ingredient.name}
            </li>
          ))}
        </ul>   
        <Image src={image} alt={title} width={300} height={300}/>
      </div>
      <div className={styles.Instructions}>
        <p>{removeHtmlTags(instructions)}</p>
      </div>
    </section>
  );
};

const Homepage = ({randomRecipes, toggleRandomRecipe}) => {
  return(
    <main className={styles.Homepage}>
      <h1>What's hot</h1>
      <div className={styles.ScrollDiv}>
      {randomRecipes.map(recipe => ( 
        <HomepageItem title={recipe.title} image={recipe.image} likes={recipe.likes} toggleRandomRecipe={toggleRandomRecipe}/>
        ))}
      </div>
    </main>
  )
}

const HomepageItem = ({ title, image, toggleRandomRecipe}) => {
  return(
    <>
      <div className={styles.HomepageItem} onClick={toggleRandomRecipe}>
        <Image src={image} width={300} height={200} alt={'title'}/>
        <h1>{title}</h1>
      </div>
    </>
  )
}