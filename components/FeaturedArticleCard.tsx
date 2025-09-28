import React from 'react';
import { Article } from '../types';

interface FeaturedArticleCardProps {
  article: Article;
  onSelect: (article: Article) => void;
}

const FeaturedArticleCard: React.FC<FeaturedArticleCardProps> = ({ article, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(article)}
      className="w-80 h-96 rounded-2xl overflow-hidden relative group cursor-pointer shrink-0"
    >
      <img
        src={article.imageUrl}
        alt={article.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <span className="inline-block bg-blue-500 dark:bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
          {article.category}
        </span>
        <h3 className="font-bold text-lg leading-tight group-hover:underline text-left">
          {article.title}
        </h3>
        {article.sources && article.sources.length > 0 && (
          <p className="text-xs text-gray-300 mt-2 text-left truncate">{article.sources[0].web.title}</p>
        )}
      </div>
    </div>
  );
};

export default FeaturedArticleCard;