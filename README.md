Recipe and Meal Planning Web Application
A simple web application built with HTML, CSS, and JavaScript that integrates the Spoonacular API to allow users to search for recipes, view detailed recipe information, plan meals, and manage favorite recipes.
Features
Recipe Search: Search for recipes based on ingredients, cuisine, or dietary preferences.
Recipe Details: View detailed information including ingredients, instructions, nutritional data, and preparation time.
Meal Planning: Organize saved recipes into a meal plan with total nutritional values and preparation times.
Favorites Management: Save and manage favorite recipes using local storage.
Responsive Design: A clean, user-friendly interface styled with CSS for seamless use across devices.
Search History: Revisit past search queries (stored locally).
Technologies Used
HTML: Structure of the web pages.
CSS: Styling for a responsive and visually appealing layout.
JavaScript: Core functionality, API integration, and local storage management.
Spoonacular API: Backend data source for recipe information.
Local Storage: Persist user data like favorites and meal plans in the browser.
Setup and Installation
Prerequisites
A modern web browser (e.g., Chrome, Firefox).
A Spoonacular API key (sign up at Spoonacular API Registration).
A simple backend proxy (optional, to securely handle API requests).
Steps
Clone the Repository:
bash
git clone https://github.com/your-username/recipe-meal-planner.git
cd recipe-meal-planner
Set Up the API Key:
Obtain your Spoonacular API key from the Spoonacular API Registration Page.
If using a backend proxy, store the API key securely (e.g., in a .env file or server-side configuration). For this simple implementation, you may include it in the JavaScript code (not recommended for production).
Open the Application:
Open index.html in a web browser to start using the application.
Alternatively, use a local server (e.g., via VS Code Live Server) for a better development experience.
Optional Backend Proxy:
To avoid exposing the API key in the frontend, set up a minimal backend (e.g., using Node.js/Express) to route API requests. Update the JavaScript fetch calls to point to your proxy endpoint.
Usage
Search Recipes:
Enter ingredients, cuisine, or diet preferences in the search bar and click "Search".
Browse results with titles, images, and brief descriptions.
View Details:
Click a recipe to see ingredients, instructions, nutritional info, and prep time.
Save Favorites:
Click the "Save to Favorites" button on a recipe to store it locally.
Plan Meals:
Add recipes to your meal plan and view total nutritional values and preparation times.
Manage Favorites:
Access the "Favorites" section to view or remove saved recipes.
Project Structure
recipe-meal-planner/
├── index.html         # Main HTML file
├── styles.css         # CSS styling
├── script.js          # JavaScript logic and API integration
├── assets/            # Images or additional static files (if any)
└── README.md          # Project documentation
Constraints
This is a front-end-only implementation using local storage instead of a database.
API requests are routed through a simple proxy or directly from the frontend (for demo purposes). In a production environment, a secure backend is recommended.
User authentication is simulated (e.g., no real login system; favorites are tied to the browser).
Future Improvements
Add a proper backend (e.g., Node.js, Express) with a database (e.g., MongoDB) for persistent storage.
Implement user authentication for personalized meal plans and favorites.
Enhance security by fully removing the API key from the frontend.
Add more advanced filtering options and recipe suggestions.
Acknowledgments
Spoonacular API for providing recipe data.
Inspired by a project task to build a recipe and meal planning tool.
