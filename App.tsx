import React, { useState, useEffect, useCallback } from 'react';
import { fetchNews } from './services/geminiService';
import { Article } from './types';
import Header from './components/Header';
import ArticleDetail from './components/ArticleDetail';
import LandingPage from './components/LandingPage';
import FeaturedArticleCard from './components/FeaturedArticleCard';
import ArticleListItem from './components/ArticleListItem';
import LoadingSkeleton from './components/LoadingSkeleton';
import ErrorMessage from './components/ErrorMessage';

const App: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Latest');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showLanding, setShowLanding] = useState(true);

  const loadNews = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    setSelectedArticle(null);
    try {
      const newsArticles = await fetchNews(query);
      setArticles(newsArticles);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unknown error occurred.");
      }
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedArticle && !showLanding) {
      loadNews(activeCategory);
    }
  }, [activeCategory, selectedArticle, showLanding, loadNews]);

  const handleSearch = (searchTerm: string) => {
    setActiveCategory(searchTerm);
  }

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  }

  const handleArticleSelect = (article: Article) => {
    setSelectedArticle(article);
  }

  const handleBack = () => {
    setSelectedArticle(null);
  }

  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  const featuredArticles = articles.slice(0, 5);
  const recommendedArticles = articles.slice(5);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100">
      <Header onSearch={handleSearch} onCategoryChange={handleCategoryChange} activeCategory={activeCategory} />

      <main className="container mx-auto px-4 pt-8 pb-12">
        {selectedArticle ? (
          <ArticleDetail article={selectedArticle} onBack={handleBack} />
        ) : (
          <>
            {loading && <LoadingSkeleton />}
            {error && <ErrorMessage message={error} />}
            {!loading && !error && (
              articles.length > 0 ? (
                <>
                  {/* Breaking News Section */}
                  <div className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-left">Breaking News</h2>
                      <a href="#" className="text-sm font-medium text-blue-500 dark:text-blue-400 hover:underline">View all</a>
                    </div>
                    <div className="flex overflow-x-auto space-x-6 scrollbar-hide -mx-4 px-4 pb-4">
                      {featuredArticles.map((article) => (
                        <FeaturedArticleCard key={article.title} article={article} onSelect={handleArticleSelect} />
                      ))}
                    </div>
                  </div>

                  {/* Recommendation Section */}
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-left">Recommendation</h2>
                      <a href="#" className="text-sm font-medium text-blue-500 dark:text-blue-400 hover:underline">View all</a>
                    </div>
                    <div className="space-y-4">
                      {recommendedArticles.map((article) => (
                        <ArticleListItem key={article.title} article={article} onSelect={handleArticleSelect} />
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-left py-16">
                  <h2 className="text-2xl font-semibold text-gray-500 dark:text-gray-400">No articles found.</h2>
                  <p className="text-gray-600 dark:text-gray-500 mt-2">Try a different category or search term.</p>
                </div>
              )
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;