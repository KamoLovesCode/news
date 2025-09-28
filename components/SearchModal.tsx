import React, { useState } from 'react';

const CATEGORIES = ["Latest", "Technology", "World News", "Business", "Sports", "Science"];

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (searchTerm: string) => void;
  onCategoryChange: (category: string) => void;
  activeCategory: string;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSearch, onCategoryChange, activeCategory }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
      setSearchTerm('');
      onClose();
    }
  };
  
  const handleCategoryClick = (category: string) => {
    onCategoryChange(category);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-md z-50 flex flex-col p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex justify-end mb-8">
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white" aria-label="Close search">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <h2 className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">Discover</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">News from all around the world</p>
        
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-0 text-gray-900 dark:text-white text-lg rounded-lg py-3 pl-12 pr-4 transition-all duration-200"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 dark:text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
          </div>
        </form>

        <div className="mt-8">
             <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
                <button
                    onClick={() => handleCategoryClick('Latest')}
                    className={`px-5 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 shrink-0 ${
                    activeCategory === 'Latest'
                        ? 'bg-blue-500 dark:bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                    All
                </button>
                {CATEGORIES.filter(c => c !== 'Latest').map(category => (
                <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`px-5 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 shrink-0 ${
                    activeCategory === category
                        ? 'bg-blue-500 dark:bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                    {category.replace(' News', '')}
                </button>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default SearchModal;