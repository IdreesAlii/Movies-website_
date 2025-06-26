import React from 'react'

const Search = ({searchTerm, setSearchTerm}) => {
return (
  <div className="search">
    <div className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 shadow-sm backdrop-blur focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all duration-200">
  <img src="search.svg" alt="search" className="w-5 h-5 opacity-60" />
  <input
    type="text"
    placeholder="Search through thousands of movies..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="text-white text-lg bg-transparent outline-none w-full placeholder:text-white/50"
  />
</div>

  </div>
)

}

export default Search