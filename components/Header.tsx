import React, { useState } from 'react';
import ThemeToggleButton from './ThemeToggleButton';
import SearchModal from './SearchModal';

interface HeaderProps {
  onSearch: (searchTerm: string) => void;
  onCategoryChange: (category: string) => void;
  activeCategory: string;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onCategoryChange, activeCategory }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Site Title */}
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            kamoc des news
          </h1>

          {/* Right Icons */}
          <div className="flex items-center space-x-2">
            <button onClick={() => setIsSearchOpen(true)} className="p-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
             <ThemeToggleButton />
          </div>
        </div>
      </header>
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)}
        onSearch={onSearch}
        onCategoryChange={onCategoryChange}
        activeCategory={activeCategory}
      />
    </>
  );
};

export default Header;