import React from 'react';

const FeaturedCardSkeleton: React.FC = () => (
  <div className="w-80 h-96 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse shrink-0"></div>
);

const ListItemSkeleton: React.FC = () => (
    <div className="flex items-center space-x-4 animate-pulse">
        <div className="w-32 h-24 rounded-lg bg-gray-200 dark:bg-gray-800"></div>
        <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
        </div>
    </div>
);


const LoadingSkeleton: React.FC = () => {
  return (
    <div>
        {/* Breaking News Skeleton */}
        <div className="mb-12">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="flex overflow-x-auto space-x-6 scrollbar-hide -mx-4 px-4 pb-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <FeaturedCardSkeleton key={index} />
                ))}
            </div>
        </div>

        {/* Recommendation Skeleton */}
        <div>
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="space-y-6">
                {Array.from({ length: 4 }).map((_, index) => (
                    <ListItemSkeleton key={index} />
                ))}
            </div>
        </div>
    </div>
  );
};

export default LoadingSkeleton;