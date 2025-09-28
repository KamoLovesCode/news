import React from 'react';
import { Article } from '../types';
import TTSControls from './TTSControls';

interface ArticleDetailProps {
  article: Article;
  onBack: () => void;
}

const ArticleDetail: React.FC<ArticleDetailProps> = ({ article, onBack }) => {
  return (
    <div className="w-full">
      <div className="relative">
        {/* Header icons over image */}
        <div className="absolute top-0 left-0 right-0 h-24 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
          <button
            onClick={onBack}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center space-x-2">
            <button
              className="flex items-center justify-center h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
              title="Bookmark article"
              aria-label="Bookmark article"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            <button
              className="flex items-center justify-center h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
              title="More options"
              aria-label="More options"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="w-full h-96">
          <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        </div>

      </div>

      {/* Article Content */}
      <div className="bg-white dark:bg-gray-900 rounded-t-3xl -mt-12 relative p-6 lg:p-8">
        <div className="max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-block bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full">{article.category}</span>
            <TTSControls
              text={`${article.title}. ${article.fullContent}`}
              className="flex-shrink-0"
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight text-left">{article.title}</h1>

          <div className="flex items-center mb-8">
            {article.sources && article.sources.length > 0 ? (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span>{article.sources[0].web.title}</span>
                <span className="mx-2">&middot;</span>
                <span>Trending</span>
              </div>
            ) : (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span>Trending</span>
              </div>
            )}
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed text-left">
            {article.fullContent.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-left">{paragraph}</p>
            ))}
          </div>
          {article.sources && article.sources.length > 0 && (
            <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3 text-left">Source</h4>
              <div className="flex flex-col space-y-2">
                {article.sources.map((source, index) => (
                  <a
                    key={index}
                    href={source.web.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-500 dark:text-blue-400 hover:underline text-left"
                  >
                    <span className="truncate">{source.web.title || new URL(source.web.uri).hostname}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;