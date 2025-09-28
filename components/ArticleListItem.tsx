import React from 'react';
import { Article } from '../types';

interface ArticleListItemProps {
  article: Article;
  onSelect: (article: Article) => void;
}

const ArticleListItem: React.FC<ArticleListItemProps> = ({ article, onSelect }) => {
  return (
    <div 
        onClick={() => onSelect(article)}
        className="flex items-center space-x-4 group cursor-pointer"
    >
        <div className="w-32 h-24 rounded-lg overflow-hidden shrink-0">
            <img 
                src={article.imageUrl} 
                alt={article.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
        </div>
        <div className="flex-1">
            <p className="text-sm font-semibold text-blue-500 dark:text-blue-400">{article.category}</p>
            <h3 className="font-bold text-lg mt-1 text-gray-900 dark:text-white group-hover:underline leading-tight">
                {article.title}
            </h3>
            {article.sources && article.sources.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{article.sources[0].web.title}</p>
            )}
        </div>
    </div>
  );
};

export default ArticleListItem;