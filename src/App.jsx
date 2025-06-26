import Search from './components/Search.jsx';
// ✅ What it does: Importing the Search component
// 🧠 What to know: Components must be imported before use
// ❓ Why we used it: To render a reusable search bar component

import { useEffect, useState } from 'react';
// ✅ What it does: Imports React hooks
// 🧠 What to know: useState stores data; useEffect runs side effects
// ❓ Why we used it: To manage and react to state changes (like loading, fetching)

import Spinner from './components/Spinner.jsx';
// ✅ What it does: Imports the Spinner loading component
// 🧠 What to know: Shows a loading animation when data is being fetched
// ❓ Why we used it: To improve user experience during API calls

import MovieCard from './components/MovieCard.jsx';
// ✅ What it does: Imports component to display each movie
// 🧠 What to know: Receives movie data as props
// ❓ Why we used it: To show movie title, image etc., in a clean format

import { useDebounce } from 'react-use';
// ✅ What it does: Imports a debounce hook
// 🧠 What to know: Debounce waits before firing an effect (delay typing response)
// ❓ Why we used it: To reduce API calls while the user is typing

import { getTrendingMovies, updateSearchCount } from './appwrite.js';
// ✅ What it does: Imports functions to interact with Appwrite backend
// 🧠 What to know: These are custom API helpers
// ❓ Why we used it: To fetch trending data and update search usage

const API_BASE_URL = 'https://api.themoviedb.org/3';
// ✅ What it does: Sets the base TMDB API URL
// 🧠 What to know: Reused in all TMDB requests
// ❓ Why we used it: To avoid repeating the base URL in every fetch

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
// ✅ What it does: Reads API key from env file
// 🧠 What to know: Vite exposes env variables using import.meta.env
// ❓ Why we used it: To keep the API key secure and hidden from public code

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
    // ✅ What it does: Sets headers for TMDB API request
    // 🧠 What to know: Authorization is required by TMDB
    // ❓ Why we used it: TMDB blocks requests without proper headers
  }
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  // ✅ What it does: Stores what user types
  // 🧠 What to know: useState updates trigger re-renders
  // ❓ Why we used it: To pass input to the API and render results

  const [errorMessage, setErrorMessage] = useState('');
  // ✅ What it does: Stores any fetch error message
  // 🧠 What to know: Empty = no error, string = show error
  // ❓ Why we used it: To give user feedback if something goes wrong

  const [moviesList, setMoviesList] = useState([]);
  // ✅ What it does: Stores movie search results
  // 🧠 What to know: Used to render MovieCard list
  // ❓ Why we used it: To display movies based on search or popularity

  const [trendingMovies, setTrendingMovies] = useState([]);
  // ✅ What it does: Stores trending movies
  // 🧠 What to know: Filled from Appwrite API
  // ❓ Why we used it: To show top trending movies on page

  const [isLoading, setIsLoading] = useState(false);
  // ✅ What it does: Tracks loading for all movies
  // 🧠 What to know: Tells when to show/hide Spinner
  // ❓ Why we used it: To show feedback during data fetching

  const [isTrendingLoading, setIsTrendingLoading] = useState(false);
  // ✅ What it does: Tracks loading for trending section
  // 🧠 What to know: Separate state from normal movies loading
  // ❓ Why we used it: To give separate control of spinners

  const [trendingError, setTrendingError] = useState('');
  // ✅ What it does: Stores error if trending fetch fails
  // 🧠 What to know: Used to conditionally render error message
  // ❓ Why we used it: To show feedback if trending fetch fails

  const [debounceSearchTerm, setDebounceSearchTerm] = useState('');
  // ✅ What it does: Stores delayed search term
  // 🧠 What to know: Debounced value updates after 500ms
  // ❓ Why we used it: To avoid calling API on every keystroke

  useDebounce(() => setDebounceSearchTerm(searchTerm), 500, [searchTerm]);
  // ✅ What it does: Sets debounce logic
  // 🧠 What to know: Runs 500ms after typing stops
  // ❓ Why we used it: Improves performance and reduces API usage

const fetchMovies = async (query = '') => {
  // ✅ Fetches movies from TMDB based on user input or shows popular movies
  // 🧠 Async function with optional query parameter
  // ❓ Used to dynamically load search results or default movie list

  setIsLoading(true);
  setErrorMessage('');
  // ✅ Shows loading spinner and clears previous error
  // 🧠 React state update triggers re-render
  // ❓ Improves UX by resetting old messages and showing loading status

  try {
    const endpoint = query
      ? `${API_BASE_URL}/search/movie?query=${encodeURI(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
    // ✅ Builds the correct API URL for search or popular movies
    // 🧠 encodeURI prevents issues with spaces/symbols in user input
    // ❓ Allows flexible fetch based on input or fallback

    const response = await fetch(endpoint, API_OPTIONS);
    // ✅ Makes the actual API call using fetch
    // 🧠 Uses custom headers from API_OPTIONS
    // ❓ Retrieves movie data from TMDB

    if (!response.ok) {
      throw new Error('Failed to fetch movies');
    }
    // ✅ Handles failed API responses
    // 🧠 response.ok is true for status 200–299
    // ❓ Prevents silent failure and shows error

    const data = await response.json();
    // ✅ Parses the JSON body of the response
    // 🧠 Must convert before accessing data
    // ❓ Needed to work with results in JavaScript

    if (data.response === 'False') {
      setErrorMessage(data.Error || 'Failed to fetch movies');
      setMoviesList([]);
      return;
    }
    // ✅ Handles cases where API sends back an error in the JSON
    // 🧠 Some APIs include errors in the response body, not status
    // ❓ Avoids showing bad or empty results on the UI

    setMoviesList(data.results || []);
    // ✅ Stores movie results into state
    // 🧠 Fallback to empty array if results are undefined
    // ❓ Lets MovieCard components render properly

    if (query && data.results.length > 0) {
      await updateSearchCount(query, data.results[0]);
    }
    // ✅ Sends search analytics to backend
    // 🧠 Only updates if there are results
    // ❓ Tracks popular user searches
  } catch (error) {
    console.log(`Error fetching movies: ${error}`);
    setErrorMessage('Error fetching movies. Please try again later.');
    // ✅ Logs and sets a user-friendly error message
    // 🧠 Prevents crash and helps debugging
    // ❓ Keeps users informed when something goes wrong
  } finally {
    setIsLoading(false);
    // ✅ Always stops the loading spinner
    // 🧠 finally runs whether error or success
    // ❓ Keeps UI state clean and accurate
  }
};

const loadTrendingMovies = async () => {
  // ✅ Loads trending movies from Appwrite backend
  // 🧠 Async function for trending section only
  // ❓ Used to show top movies when page loads

  setIsTrendingLoading(true);
  setTrendingError('');
  // ✅ Shows loading spinner and clears old error
  // 🧠 Updates separate state just for trending
  // ❓ Improves UX while loading trending content

  try {
    const movies = await getTrendingMovies();
    setTrendingMovies(movies);
    // ✅ Fetches trending movie list and updates state
    // 🧠 getTrendingMovies is a custom helper from Appwrite
    // ❓ Displays dynamic trending content
  } catch (error) {
    console.error(`Error fetching trending movies: ${error}`);
    setTrendingError('Failed to load trending movies.');
    // ✅ Handles fetch errors with message and logging
    // 🧠 Keeps error separate from search error
    // ❓ Prevents app crash and informs user
  } finally {
    setIsTrendingLoading(false);
    // ✅ Always hides trending spinner
    // 🧠 Ensures UI returns to normal
    // ❓ Keeps app clean and responsive
  }
};


  useEffect(() => {
    fetchMovies(debounceSearchTerm);
  }, [debounceSearchTerm]);
  // ✅ Runs when debounced search term changes
  // 🧠 useEffect runs side effects
  // ❓ Why we used it: To fetch new movies when input changes

  useEffect(() => {
    loadTrendingMovies();
  }, []);
  // ✅ Runs only once on first render
  // 🧠 useEffect with [] = run once
  // ❓ Why we used it: To load trending when page opens

  return (
    <main>
      <div className="pattern" />
      {/* ✅ Visual background styling */}
      {/* ❓ Why we used it: To decorate the page */}

      <div className="wrapper">
        {/* ✅ Page container for all content */}
        {/* ❓ Why we used it: To apply layout styling */}

<header>
  <img src="./hero.png" alt="Hero Banner" />
  {/* ✅ Displays a hero/banner image at the top of the page
      🧠 Should always include an alt tag for accessibility
      ❓ Used to make the page visually appealing */}

  <h1>
    Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle
  </h1>
  {/* ✅ Main heading of the website
      🧠 <span> is used to style part of the text (with gradient)
      ❓ Communicates the main value of the site to users */}

  <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
  {/* ✅ Renders the Search component
      🧠 Props are passed down to allow child component to update parent state
      ❓ Used to let the user type input and trigger movie search */}
</header>

<section className='trending'>
  <h2>Trending <span className='text-gradient'>Movies</span></h2>
  {/* ✅ Subheading for the trending section
      🧠 Semantic HTML improves accessibility and SEO
      ❓ Makes it clear this section shows trending content */}

  {isTrendingLoading ? (
    <Spinner />
    // ✅ Show loading spinner while trending movies are being fetched
    // 🧠 Conditional rendering based on loading state
    // ❓ Gives user feedback that something is loading
  ) : trendingError ? (
    <p className="text-red-500">{trendingError}</p>
    // ✅ Display error message if something goes wrong
    // 🧠 Helps users understand when something fails
    // ❓ Better than leaving the section blank on error
  ) : trendingMovies.length > 0 ? (
    <ul>
      {trendingMovies.map((movie, index) => (
        <li key={movie.$id}>
          <p>{index + 1}</p>
          {/* ✅ Display the movie's rank in the list
              🧠 Index from .map gives current position
              ❓ Adds context and ordering to movies */}

          <img src={movie.poster_url} alt={movie.title} />
          {/* ✅ Show the poster image of the movie
              🧠 Must have an alt tag for accessibility
              ❓ Visually displays the trending movie */}
        </li>
      ))}
    </ul>
    // ✅ Render the list of trending movies
    // 🧠 Always provide a unique key (movie.$id) to help React
    // ❓ Shows trending data dynamically from Appwrite
  ) : (
    <p className="text-gray-400">No trending movies found.</p>
    // ✅ Fallback if there are no trending movies
    // 🧠 Ensures there's always something visible in the section
    // ❓ Prevents confusion when list is empty
  )}
</section>

<section className="all-movies">
  <h2>All <span className='text-gradient'>Movies</span></h2>
  {/* ✅ Subheading for main movie list
      🧠 Improves structure and readability
      ❓ Clarifies this section shows search or popular movies */}

  {isLoading ? (
    <Spinner />
    // ✅ Show loading spinner during movie fetch
    // 🧠 Visual cue that data is being loaded
    // ❓ Keeps user engaged during wait
  ) : errorMessage ? (
    <p className="text-red-500">{errorMessage}</p>
    // ✅ Show error message if API fails
    // 🧠 Better than failing silently
    // ❓ Helps user understand what went wrong
  ) : (
    <ul>
      {moviesList.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
        // ✅ Render each movie using a reusable card component
        // 🧠 movie.id is used as a unique key for performance
        // ❓ Keeps UI modular and easy to update
      ))}
    </ul>
    // ✅ Renders all fetched movies as a list
    // 🧠 Only shown if there’s no error and not loading
    // ❓ Ensures the UI stays clean and performant
  )}
</section>

<h1 className="text-white">{searchTerm}</h1>
{/* ✅ Display the user's current search input in real-time
    🧠 Reflecting state improves user feedback
    ❓ Good for debugging and showing input is working */}
  </div>
    </main>
  );
    // ✅ Main component that renders the entire app
   // 🧠 Combines all sections and logic into a single component}
    // ❓ Used as the root component in main.jsx to start the app
}
export default App;
// ✅ Makes this component available to be used in other files
// ❓ Why we used it: So main.jsx or other entry files can render it