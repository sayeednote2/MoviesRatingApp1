import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import { Star, Trophy, User, ChevronDown, ChevronUp, Tv } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Series {
  id: string;
  title: string;
  rating: number;
  category: 'must-watch' | 'good' | 'one-time-watch' | 'bad';
  language: string;
  ageRating: string;
  contentType: 'movie' | 'tv-series';
  year: number;
  timestamp: number;
  userId: string;
  username: string;
  ratings?: Record<string, Record<string, { value: number; timestamp: number; }>>;
}

const categoryColors: Record<Series['category'], { bg: string; text: string }> = {
  'must-watch': { bg: 'bg-green-50', text: 'text-green-700' },
  'good': { bg: 'bg-blue-50', text: 'text-blue-700' },
  'one-time-watch': { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  'bad': { bg: 'bg-red-50', text: 'text-red-700' },
};

export default function TopTVSeries() {
  const [series, setSeries] = useState<Series[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isListVisible, setIsListVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const calculateAverageRating = (series: Series) => {
    const ratings = [series.rating]; // Include original rating
    
    if (series.ratings) {
      Object.values(series.ratings).forEach(userRatings => {
        Object.values(userRatings).forEach(rating => {
          if (rating && typeof rating.value === 'number') {
            ratings.push(rating.value);
          }
        });
      });
    }
    
    const sum = ratings.reduce((acc, val) => acc + val, 0);
    return (sum / ratings.length).toFixed(1);
  };

  useEffect(() => {
    const seriesRef = ref(db, 'movies');
    const unsubscribe = onValue(seriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const seriesList = Object.entries(data)
          .map(([id, series]) => ({
            id,
            ...(series as Omit<Series, 'id'>),
          }))
          .filter(series => 
            series.contentType === 'tv-series' && 
            series.year === selectedYear
          )
          .sort((a, b) => {
            const avgA = parseFloat(calculateAverageRating(a));
            const avgB = parseFloat(calculateAverageRating(b));
            return avgB - avgA;
          });
        
        setSeries(seriesList);
      } else {
        setSeries([]);
      }
    });

    return () => unsubscribe();
  }, [selectedYear]);

  const formatCategory = (category: string) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);

  const totalPages = Math.ceil(series.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSeries = series.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <button
        onClick={() => setIsListVisible(!isListVisible)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <Tv className="w-6 h-6 text-indigo-500" />
          <h2 className="text-lg font-semibold text-gray-800">Top TV Series of {selectedYear}</h2>
        </div>
        {isListVisible ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isListVisible && (
        <div className="p-5 border-t">
          <div className="flex items-center justify-end gap-2 mb-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-sm border rounded-lg py-1.5 px-2"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {series.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No TV Series found for {selectedYear}</p>
            ) : (
              <>
                {currentSeries.map((series, index) => (
                  <div
                    key={series.id}
                    className="border rounded-lg p-4 hover:shadow-md transition duration-200"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                          #{startIndex + index + 1}
                        </span>
                        <h3 className="text-base font-medium text-gray-800 flex-1">
                          {series.title}
                        </h3>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-semibold text-yellow-700 text-sm">
                            {calculateAverageRating(series)}/10
                          </span>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full ${categoryColors[series.category].bg}`}>
                          <span className={`text-sm font-medium ${categoryColors[series.category].text}`}>
                            {formatCategory(series.category)}
                          </span>
                        </div>
                        <div className="px-3 py-1.5 rounded-full bg-purple-50">
                          <span className="text-sm font-medium text-purple-700">
                            {series.language.charAt(0).toUpperCase() + series.language.slice(1)}
                          </span>
                        </div>
                        <div className="px-3 py-1.5 rounded-full bg-red-50">
                          <span className="text-sm font-medium text-red-700">
                            {series.ageRating}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{series.username}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <span>{formatDistanceToNow(series.timestamp, { addSuffix: true })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}