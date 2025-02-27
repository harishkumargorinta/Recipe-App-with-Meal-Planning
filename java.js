const API_KEY = '98dbf2f8fea14c0ca8b7fc6cd8b8f3ab';
const BASE_URL = 'https://api.spoonacular.com/recipes/complexSearch';

// Function to fetch recipes from API
async function searchRecipes() {
    const query = document.getElementById('searchQuery').value;
    const cuisine = document.getElementById('cuisineFilter').value;
    const diet = document.getElementById('dietFilter').value;
    const prepTime = document.getElementById('prepTimeFilter').value;
    
    let url = `${BASE_URL}?apiKey=${API_KEY}&query=${query}&cuisine=${cuisine}&diet=${diet}&maxReadyTime=${prepTime}&number=10&addRecipeInformation=true`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayRecipes(data.results);
    } catch (error) {
        console.error('Error fetching recipes:', error);
    }
}

// Function to display recipes in the UI
function displayRecipes(recipes) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';
    
    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.style.backgroundColor = 'rgba(255, 99, 71, 0.8)'; // Warm red-orange shade
        card.style.color = 'white';
        card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <button class="view-details-btn" onclick="viewRecipe(${recipe.id})">View Details</button>
            <button style="background-color: #FFD700; color: black;" onclick="addToFavorites(${recipe.id}, '${recipe.title}', '${recipe.image}')">Add to Favorites</button>
            <button style="background-color: #32CD32; color: white;" onclick="addToMealPlan(${recipe.id}, '${recipe.title}', '${recipe.image}')">Add to Meal Plan</button>
        `;
        resultsDiv.appendChild(card);
    });
}

function addToFavorites(id, title, image) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    // Check if the recipe is already in favorites
    if (!favorites.some(recipe => recipe.id === id)) {
        favorites.push({ id, title, image });
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
    }
}

function displayFavorites() {
    const favoritesDiv = document.getElementById('favoritesList');
    favoritesDiv.innerHTML = '';
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let totalCalories = 0;
    let totalPrepTime = 0;
    
    favorites.forEach(recipe => {
        totalCalories += recipe.calories || 0;
        totalPrepTime += recipe.prepTime || 0;
        
        const card = document.createElement('div');
        card.classList.add('card');
        card.style.backgroundColor = 'rgba(255, 165, 0, 0.8)'; // Orange shade
        card.style.color = 'white';
        card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <p>Calories: ${recipe.calories || 'N/A'}</p>
            <p>Prep Time: ${recipe.prepTime || 'N/A'} min</p>
            <button class="view-details-btn" onclick="viewRecipe(${recipe.id})">View Details</button>
            <button style="background-color: #FF4500; color: white;" onclick="removeFavorite(${recipe.id})">Remove</button>
        `;
        favoritesDiv.appendChild(card);
    });
    
    document.getElementById('totalNutrients').innerHTML = `Total Calories: ${totalCalories} | Total Prep Time: ${totalPrepTime} min`;
}

// Function to view recipe details
async function viewRecipe(recipeId) {
    const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`;
    try {
        const response = await fetch(url);
        const recipe = await response.json();
        document.getElementById('recipeDetails').innerHTML = `
            <div style="max-height: 400px; overflow-y: auto; padding: 10px;">
                <h2 style="color: #FF4500;">${recipe.title}</h2>
                <img src="${recipe.image}" alt="${recipe.title}">
                <h3 style="color: #32CD32;">Ingredients</h3>
                <ul>${recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}</ul>
                <h3 style="color: #32CD32;">Instructions</h3>
                <p>${recipe.instructions}</p>
                <h3 style="color: #FFD700;">Nutritional Information</h3>
                <p>Ready in: ${recipe.readyInMinutes} minutes</p>
            </div>
        `;
        document.getElementById('recipeModal').style.display = 'flex';
    } catch (error) {
        console.error('Error fetching recipe details:', error);
    }
}

// Function to remove from favorites
function removeFavorite(id) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(recipe => recipe.id !== id);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
}




// Function to add a recipe to the meal planner with day and meal type selection
function addToMealPlanner(id, title, image) {
    // Create the form dynamically
    const mealPlannerForm = document.createElement("div");
    mealPlannerForm.classList.add("meal-planner-popup");

    mealPlannerForm.innerHTML = `
        <div class="meal-planner-container">
            <h3>Add "${title}" to your Meal Planner</h3>
            <label for="daySelect">Select a day:</label>
            <select id="daySelect">
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
            </select>
            
            <label for="mealTypeSelect">Select meal type:</label>
            <select id="mealTypeSelect">
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snacks">Snacks</option>
            </select>
            
            <button onclick="saveMeal('${id}', '${title}', '${image}')">Save</button>
            <button onclick="closeMealPlannerPopup()">Cancel</button>
        </div>
    `;

    document.body.appendChild(mealPlannerForm);
}

// Function to save the meal plan entry to localStorage
function saveMeal(id, title, image) {
    const selectedDay = document.getElementById("daySelect").value;
    const selectedMeal = document.getElementById("mealTypeSelect").value;

    let mealPlan = JSON.parse(localStorage.getItem('mealPlan')) || [];

    if (!mealPlan.some(recipe => recipe.id === id && recipe.day === selectedDay && recipe.mealType === selectedMeal)) {
        mealPlan.push({ id, title, image, day: selectedDay, mealType: selectedMeal });
        localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
        displayMealPlan();
    }

    closeMealPlannerPopup();
}

// Function to display the meal plan
function displayMealPlan() {
    const mealPlanDiv = document.getElementById('mealPlanner');
    mealPlanDiv.innerHTML = '';
    let mealPlan = JSON.parse(localStorage.getItem('mealPlan')) || [];
    
    let days = {};
    mealPlan.forEach(recipe => {
        if (!days[recipe.day]) days[recipe.day] = {};
        if (!days[recipe.day][recipe.mealType]) days[recipe.day][recipe.mealType] = [];
        days[recipe.day][recipe.mealType].push(recipe);
    });

    for (const [day, meals] of Object.entries(days)) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add("meal-day");
        dayDiv.innerHTML = `<h3>${day}</h3>`;

        for (const [mealType, recipes] of Object.entries(meals)) {
            const mealDiv = document.createElement('div');
            mealDiv.classList.add("meal-category");
            mealDiv.innerHTML = `<h4>${mealType}</h4>`;

            const mealList = document.createElement("div");
            mealList.classList.add("meal-list");

            recipes.forEach(recipe => {
                const card = document.createElement('div');
                card.classList.add('meal-card');
                card.innerHTML = `
                    <img src="${recipe.image}" alt="${recipe.title}">
                    <h3>${recipe.title}</h3>
                    <button style="background-color: #FF4500; color: white;" onclick="removeFromMealPlan('${recipe.id}', '${day}', '${mealType}')">Remove</button>
                `;
                mealList.appendChild(card);
            });

            mealDiv.appendChild(mealList);
            dayDiv.appendChild(mealDiv);
        }

        mealPlanDiv.appendChild(dayDiv);
    }
}

// Function to remove a meal from the planner
function removeFromMealPlan(id, day, mealType) {
    let mealPlan = JSON.parse(localStorage.getItem('mealPlan')) || [];
    mealPlan = mealPlan.filter(recipe => !(recipe.id === id && recipe.day === day && recipe.mealType === mealType));
    localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
    displayMealPlan();
}

// Function to close the meal planner popup
function closeMealPlannerPopup() {
    document.querySelector(".meal-planner-popup").remove();
}

// Function to display recipes
function displayRecipes(recipes) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';

    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <button onclick="viewRecipe(${recipe.id})">View Details</button>
            <button onclick="addToMealPlanner('${recipe.id}', '${recipe.title}', '${recipe.image}')">Add to Meal Planner</button>
        `;
        resultsDiv.appendChild(card);
    });
}




// Load favorites and past searches on page load
document.addEventListener('DOMContentLoaded', () => {
    displayFavorites();
    displayMealPlan();
});
