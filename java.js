const API_KEY = '98dbf2f8fea14c0ca8b7fc6cd8b8f3ab'; // Ideally move to backend proxy
const BASE_URL = 'https://api.spoonacular.com/recipes';

// Fetch recipes from Spoonacular API and include nutritional data
async function searchRecipes() {
    const query = document.getElementById('searchQuery').value.trim();
    const cuisine = document.getElementById('cuisineFilter').value;
    const diet = document.getElementById('dietFilter').value;
    const prepTime = document.getElementById('prepTimeFilter').value;

    if (!query) {
        alert('Please enter a search query!');
        return;
    }

    storeSearchQuery(query); // Store the search query

    const url = `${BASE_URL}/complexSearch?apiKey=${API_KEY}&query=${query}&cuisine=${cuisine}&diet=${diet}&maxReadyTime=${prepTime}&number=10&addRecipeInformation=true`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        const recipes = data.results || [];

        // Fetch detailed information for each recipe to get nutritional data
        const detailedRecipes = await Promise.all(
            recipes.map(async recipe => {
                const detailUrl = `${BASE_URL}/${recipe.id}/information?apiKey=${API_KEY}&includeNutrition=true`;
                const detailResponse = await fetch(detailUrl);
                if (!detailResponse.ok) throw new Error('Failed to fetch recipe details');
                const detailData = await detailResponse.json();
                return {
                    ...recipe,
                    nutrition: detailData.nutrition, // Include nutritional data
                    readyInMinutes: detailData.readyInMinutes // Ensure prep time is available
                };
            })
        );

        displayRecipes(detailedRecipes);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        alert('Failed to fetch recipes. Please try again later.');
    }
}

// Display search results
function displayRecipes(recipes) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = recipes.length ? '' : '<p>No recipes found.</p>';

    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.classList.add('card', 'recipe-card');
        card.innerHTML = `
            <img src="${recipe.image || 'placeholder.jpg'}" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <button class="view-details-btn" onclick="viewRecipe(${recipe.id})">View Details</button>
            <button class="favorite-btn" onclick="addToFavorites(${recipe.id}, '${recipe.title}', '${recipe.image}', ${recipe.nutrition?.nutrients.find(n => n.name === 'Calories')?.amount || 0}, ${recipe.readyInMinutes || 0})">Add to Favorites</button>
            <button class="meal-plan-btn" onclick="addToMealPlanner(${recipe.id}, '${recipe.title}', '${recipe.image}', ${recipe.nutrition?.nutrients.find(n => n.name === 'Calories')?.amount || 0}, ${recipe.readyInMinutes || 0})">Add to Meal Plan</button>
        `;
        resultsDiv.appendChild(card);
    });
}

// Add recipe to favorites
function addToFavorites(id, title, image, calories, prepTime) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.some(recipe => recipe.id === id)) {
        favorites.push({ id, title, image, calories, prepTime });
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
        alert(`${title} added to favorites!`);
    } else {
        alert(`${title} is already in your favorites.`);
    }
}

// Display favorites with totals
function displayFavorites() {
    const favoritesDiv = document.getElementById('favoritesList');
    const totalsDiv = document.getElementById('totalNutrients') || document.createElement('div');
    totalsDiv.id = 'totalNutrients';
    favoritesDiv.innerHTML = '';

    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let totalCalories = 0;
    let totalPrepTime = 0;

    favorites.forEach(recipe => {
        totalCalories += recipe.calories || 0;
        totalPrepTime += recipe.prepTime || 0;

        const card = document.createElement('div');
        card.classList.add('card', 'favorite-card');
        card.innerHTML = `
            <img src="${recipe.image}" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <p>Calories: ${recipe.calories || 'N/A'}</p>
            <p>Prep Time: ${recipe.prepTime || 'N/A'} min</p>
            <button class="view-details-btn" onclick="viewRecipe(${recipe.id})">View Details</button>
            <button class="remove-btn" onclick="removeFavorite(${recipe.id})">Remove</button>
        `;
        favoritesDiv.appendChild(card);
    });

    totalsDiv.textContent = `Total Calories: ${totalCalories} | Total Prep Time: ${totalPrepTime} min`;
    if (!document.getElementById('totalNutrients')) favoritesDiv.after(totalsDiv);
}

// View recipe details in modal
async function viewRecipe(recipeId) {
    const url = `${BASE_URL}/${recipeId}/information?apiKey=${API_KEY}&includeNutrition=true`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('API request failed');
        const recipe = await response.json();
        document.getElementById('recipeDetails').innerHTML = `
            <div class="modal-scroll">
                <h2>${recipe.title}</h2>
                <img src="${recipe.image}" alt="${recipe.title}">
                <h3>Ingredients</h3>
                <ul>${recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}</ul>
                <h3>Instructions</h3>
                <p>${recipe.instructions || 'No instructions available.'}</p>
                <h3>Nutritional Information</h3>
                <p>Ready in: ${recipe.readyInMinutes} minutes</p>
                <p>Calories: ${recipe.nutrition?.nutrients.find(n => n.name === 'Calories')?.amount || 'N/A'} kcal</p>
            </div>
        `;
        document.getElementById('recipeModal').style.display = 'flex';
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        alert('Failed to load recipe details.');
    }
}

// Remove from favorites
function removeFavorite(id) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(recipe => recipe.id !== id);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
}

// Add to meal planner with popup
function addToMealPlanner(id, title, image, calories, prepTime) {
    const mealPlannerForm = document.createElement('div');
    mealPlannerForm.classList.add('meal-planner-popup');
    mealPlannerForm.innerHTML = `
        <div class="meal-planner-container">
            <h3>Add "${title}" to Meal Planner</h3>
            <label for="daySelect">Select Day:</label>
            <select id="daySelect">
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
            </select>
            <label for="mealTypeSelect">Select Meal Type:</label>
            <select id="mealTypeSelect">
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snacks">Snacks</option>
            </select>
            <button onclick="saveMeal('${id}', '${title}', '${image}', ${calories}, ${prepTime})">Save</button>
            <button onclick="closeMealPlannerPopup()">Cancel</button>
        </div>
    `;
    document.body.appendChild(mealPlannerForm);
}

// Save meal to localStorage
function saveMeal(id, title, image, calories, prepTime) {
    const day = document.getElementById('daySelect').value;
    const mealType = document.getElementById('mealTypeSelect').value;
    let mealPlan = JSON.parse(localStorage.getItem('mealPlan')) || [];

    if (!mealPlan.some(r => r.id === id && r.day === day && r.mealType === mealType)) {
        mealPlan.push({ id, title, image, day, mealType, calories, prepTime });
        localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
        displayMealPlan();
        alert(`${title} added to ${day} - ${mealType}!`);
    } else {
        alert(`${title} is already planned for ${day} - ${mealType}.`);
    }
    closeMealPlannerPopup();
}

// Display meal plan in a horizontal layout with totals
function displayMealPlan() {
    const mealPlanDiv = document.getElementById('mealPlanner');
    mealPlanDiv.innerHTML = '';
    let mealPlan = JSON.parse(localStorage.getItem('mealPlan')) || [];

    // Group meals by day
    let days = {};
    mealPlan.forEach(recipe => {
        if (!days[recipe.day]) days[recipe.day] = {};
        if (!days[recipe.day][recipe.mealType]) days[recipe.day][recipe.mealType] = [];
        days[recipe.day][recipe.mealType].push(recipe);
    });

    // Define the order of meal types for consistent display
    const mealTypesOrder = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

    // Render each day
    for (const [day, meals] of Object.entries(days)) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('meal-day');
        dayDiv.innerHTML = `<h3>${day}</h3>`;

        // Create a container for meal types
        const mealsContainer = document.createElement('div');
        mealsContainer.classList.add('meals-container');

        // Calculate totals for the day
        let totalCalories = 0;
        let totalPrepTime = 0;

        // Render each meal type in order
        mealTypesOrder.forEach(mealType => {
            if (meals[mealType]) {
                const mealDiv = document.createElement('div');
                mealDiv.classList.add('meal-category');
                mealDiv.innerHTML = `<h4>${mealType}</h4>`;

                const mealList = document.createElement('div');
                mealList.classList.add('meal-list');

                meals[mealType].forEach(recipe => {
                    totalCalories += Number(recipe.calories) || 0; // Ensure calories is a number
                    totalPrepTime += Number(recipe.prepTime) || 0; // Ensure prepTime is a number

                    const card = document.createElement('div');
                    card.classList.add('meal-card');
                    card.innerHTML = `
                        <img src="${recipe.image}" alt="${recipe.title}">
                        <h3>${recipe.title}</h3>
                        <button class="remove-btn" onclick="removeFromMealPlan('${recipe.id}', '${day}', '${mealType}')">Remove</button>
                    `;
                    mealList.appendChild(card);
                });

                mealDiv.appendChild(mealList);
                mealsContainer.appendChild(mealDiv);
            }
        });

        // Add totals for the day
        const totalsDiv = document.createElement('div');
        totalsDiv.classList.add('day-totals');
        totalsDiv.textContent = `Total Calories: ${totalCalories} | Total Prep Time: ${totalPrepTime} min`;
        dayDiv.appendChild(mealsContainer);
        dayDiv.appendChild(totalsDiv);
        mealPlanDiv.appendChild(dayDiv);
    }
}

// Remove from meal plan
function removeFromMealPlan(id, day, mealType) {
    let mealPlan = JSON.parse(localStorage.getItem('mealPlan')) || [];
    mealPlan = mealPlan.filter(r => !(r.id === id && r.day === day && r.mealType === mealType));
    localStorage.setItem('mealPlan', JSON.stringify(mealPlan));
    displayMealPlan();
}

// Close meal planner popup
function closeMealPlannerPopup() {
    const popup = document.querySelector('.meal-planner-popup');
    if (popup) popup.remove();
}

// Close modal
function closeModal() {
    document.getElementById('recipeModal').style.display = 'none';
}

// Store search query in history
function storeSearchQuery(query) {
    if (!query) return;
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    const timestamp = new Date().toLocaleString();
    searchHistory = searchHistory.filter(item => item.query !== query); // Remove duplicates
    searchHistory.unshift({ query, timestamp }); // Add to the beginning
    if (searchHistory.length > 10) searchHistory.pop(); // Limit to 10 entries
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    displaySearchHistory();
}

// Display search history
function displaySearchHistory() {
    const historyDiv = document.getElementById('searchHistory');
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    historyDiv.innerHTML = '';

    searchHistory.forEach(item => {
        const p = document.createElement('p');
        p.textContent = `${item.query} (Searched on: ${item.timestamp})`;
        p.onclick = () => {
            document.getElementById('searchQuery').value = item.query;
            searchRecipes();
        };
        historyDiv.appendChild(p);
    });
}

// Load favorites, meal plan, and search history on page load
document.addEventListener('DOMContentLoaded', () => {
    displayFavorites();
    displayMealPlan();
    displaySearchHistory();
});
