import { Client, Databases, ID, Query } from "appwrite";
// ✅ What it does: Imports required Appwrite SDK classes
// 🧠 What to know:
// - Client: connects to Appwrite backend
// - Databases: lets you manage collections/documents
// - ID: helps create unique document IDs
// - Query: lets you search, filter, or sort database entries
// ❓ Why we used it: To connect and interact with Appwrite's database features

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
// ✅ What it does: Loads the Project ID from environment variables
// 🧠 What to know: Required to target the right Appwrite project
// ❓ Why we used it: Keeps config private and manageable

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
// ✅ What it does: Loads the Database ID from .env
// 🧠 What to know: A database can have many collections
// ❓ Why we used it: So our queries go to the correct database

const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
// ✅ What it does: Loads the Collection ID (like a table name)
// 🧠 What to know: Collection stores documents like rows in a table
// ❓ Why we used it: This is where we store search data

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  // ✅ What it does: Tells Appwrite which server to connect to
  // 🧠 What to know: Cloud users always use this endpoint
  // ❓ Why we used it: Required setup for Appwrite to work
  .setProject(PROJECT_ID);
// ✅ What it does: Links the client to your specific project
// 🧠 What to know: Without this, Appwrite won't know what to access
// ❓ Why we used it: Essential for authentication and permissions

const database = new Databases(client);
// ✅ What it does: Creates a database instance for queries
// 🧠 What to know: All read/write actions use this instance
// ❓ Why we used it: To run search, update, and create actions on movie data

export const updateSearchCount = async (searchTerm, movie) => {
  // ✅ What it does: Adds or updates a movie's search count in the DB
  // 🧠 What to know: Checks if search exists first, then updates or inserts
  // ❓ Why we used it: To track which movies are being searched the most

  try {
    const result = await database.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.equal('searchTerm', searchTerm)]
    );
    // ✅ What it does: Finds any document with matching searchTerm
    // 🧠 What to know: Should return max 1 result
    // ❓ Why we used it: So we don't duplicate search entries

    if (result.documents.length > 0) {
      const doc = result.documents[0];
      await database.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        doc.$id,
        { count: doc.count + 1 }
      );
      // ✅ What it does: Increments count if movie was already searched
      // 🧠 What to know: Updates only the count field
      // ❓ Why we used it: To log another search for that movie
    } else {
      await database.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(), // auto-generate document ID
        {
          searchTerm: searchTerm,
          count: 1,
          movie_id: movie.id,
          poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        }
      );
      // ✅ What it does: Creates new document for a movie search
      // 🧠 What to know: Stores movie data + poster URL
      // ❓ Why we used it: To start tracking new movie search
    }
  } catch (error) {
    console.log(error);
    // ✅ What it does: Catches and logs any errors
    // 🧠 What to know: Important for debugging
    // ❓ Why we used it: Prevents app from crashing silently
  }
};

export const getTrendingMovies = async () => {
  // ✅ What it does: Gets top 5 searched movies
  // 🧠 What to know: Sorted by 'count' in descending order
  // ❓ Why we used it: To display trending content to the user

  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc('count')
    ]);
    // ✅ What it does: Returns top 5 most searched movies
    // 🧠 What to know: count = how many times searched
    // ❓ Why we used it: To show most popular results in UI

    return result.documents;
    // ✅ What it does: Sends the documents back to caller (App.jsx)
    // 🧠 What to know: Can be displayed as trending list
    // ❓ Why we used it: Needed to dynamically load top searches
  } catch (error) {
    console.error(error);
    // ✅ What it does: Logs error if query fails
    // 🧠 What to know: Likely due to wrong ID or permissions
    // ❓ Why we used it: So dev can fix any fetch issues
  }
};
