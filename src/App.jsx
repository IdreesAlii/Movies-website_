import Search from './components/Search.jsx'; 
// Importing the Search component from the components folder

import { useEffect, useState } from 'react'; 
import Spinner from './components/spinner.jsx';
// Importing React hooks: useEffect to run code on component load, useState to store values

// API - Application Programming Interface - a set of rules 
// that allows one piece of software to interact with another.

const API_BASE_URL = 'https://api.themoviedb.org/3'; 
// The base URL for TMDB API requests

const API_KEY = import.meta.env.VITE_TMDB_API_KEY; 
// Accessing your secret API key from the .env file (Vite uses import.meta.env)

const API_OPTIONS = { 
  method: 'GET', 
  headers: {
    accept: 'application/json', 
    Authorization: `Bearer ${API_KEY}` 
    // This is how TMDB expects you to send the bearer token
  }
};
// Configuration for the fetch request: GET method, required headers

const App = () => {
  const [searchTerm, setSearchTerm] = useState(''); 
  // searchTerm holds what the user types; setSearchTerm updates it

  const [errorMessage, setErrorMessage] = useState(''); 
  // Stores an error message if fetching data fails

  const [moviesList, setMoviesList] = useState([]); 
  // This array will hold the fetched movies from TMDB

  const [isLoading, setIsLoading] = useState(false); 
  // Tracks if the app is currently fetching data (true = loading spinner should show)

  const fetchMovies = async () => {
    setIsLoading(true); 
    // When this function starts, show loading spinner

    setErrorMessage(''); 
    // Clear previous error messages

    try {
      const endpoint = `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`; 
      // Full URL to fetch popular movies from TMDB

      const response = await fetch(endpoint, API_OPTIONS); 
      // Fetching data from TMDB with headers

      if (!response.ok) {
        throw new Error('Failed to fetch movies'); 
        // If server responds with error, throw custom message
      }

      const data = await response.json(); 
      // Convert raw response to JSON

      if (data.response === 'False') {
        // This condition is not needed for TMDB but kept because you want it
        setErrorMessage(data.Error || 'Failed to fetch movies'); 
        setMoviesList([]); 
        return; 
      }

      setMoviesList(data.results || []); 
      // Save the movie list in state (or empty array if data.results is missing)

    } catch (error) {
      console.log(`Error fetching movies: ${error}`); 
      // Show error in the console for debugging

      setErrorMessage('Error fetching movies. Please try again later.'); 
      // Display a user-friendly error message
    } finally {
      setIsLoading(false); 
      // Always stop loading spinner, even if fetch fails
    }
  };

  useEffect(() => {
    fetchMovies(); 
    // Run fetchMovies() one time when the component mounts
  }, []);

  return (
    <main>
      <div className="pattern" /> 
      {/* Decorative background element (CSS class adds visuals) */}

      <div className="wrapper"> 
        {/* Main container for the page content */}

        <header>
          <img src="./hero.png" alt="Hero Banner" /> 
          {/* Top image banner */}
          
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle
          </h1> 
          {/* Page heading with gradient text for “Movies” */}

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} /> 
          {/* Render the search bar component and give it state */}
        </header>

        <section className="all-movies">
          <h2 className='mt-[40px]'>All Movies</h2> 
          {/* Section title */}

          {isLoading ? (
            <Spinner />
            // If still loading, show the spinner (you will need to define this later)
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p> 
            // If there’s an error, show it in red text
          ) : (
            <ul>
              {moviesList.map((movie) => (
                <p key={movie.id} className="text-white">
                  {movie.title}
                </p> 
                // Show each movie title in white text, use movie ID as React key
              ))}
            </ul>
          )}
        </section>

        <h1 className="text-white">{searchTerm}</h1> 
        {/* Just shows what the user typed in real-time */}
      </div>
    </main>
  );
};

export default App; 
// Export the App component so it can be used in main.jsx or wherever needed
