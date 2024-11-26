import React, { useState, useEffect } from 'react';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { db } from '../firebase';
import { Star, Film, User, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Movie {
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

const categoryColors: Record<Movie['category'], { bg: string; text: string }> = {
  'must-watch': { bg: 'bg-green-50', text: 'text-green-700' },
  'good': { bg: 'bg-blue-50', text: 'text-blue-700' },
  'one-time-watch': { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  'bad': { bg: 'bg-red-50', text: 'text-red-700' },
};

const ratingButtonClass = (isSelected: boolean) => `
  w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
  ${isSelected 
    ? 'bg-indigo-600 text-white' 
    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} 
  transition-colors duration-200
`;

export default function MovieList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [sortBy, setSortBy] = useState<'latest' | 'rating'>('latest');
  const [isListVisible, setIsListVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
  const itemsPerPage = 15;

  const calculateAverageRating = (movie: Movie) => {
    const ratings = [movie.rating]; // Include original rating
    
    if (movie.ratings) {
      Object.values(movie.ratings).forEach(userRatings => {
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
    const moviesRef = ref(db, 'movies');
    const unsubscribe = onValue(moviesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const moviesList = Object.entries(data)
          .map(([id, movie]) => ({
            id,
            ...(movie as Omit<Movie, 'id'>),
          }))
          .filter(movie => movie.contentType === 'movie')
          .sort((a, b) => {
            if (sortBy === 'latest') {
              return b.timestamp - a.timestamp;
            }
            const avgA = parseFloat(calculateAverageRating(a));
            const avgB = parseFloat(calculateAverageRating(b));
            return avgB - avgA;
          });
        
        setMovies(moviesList);
      } else {
        setMovies([]);
      }
    });

    return () => unsubscribe();
  }, [sortBy]);

  const handleDelete = async (movieId: string) => {
    if (!user) {
      toast.error('Please sign in to delete');
      return;
    }

    try {
      await remove(ref(db, `movies/${movieId}`));
      toast.success('Movie deleted successfully');
    } catch (error) {
      toast.error('Failed to delete movie');
      console.error('Error deleting movie:', error);
    }
  };

  const handleRating = async (movieId: string, rating: number) => {
    if (!user) {
      toast.error('Please sign in to rate');
      return;
    }

    if (movies.find(m => m.id === movieId)?.userId === user.id) {
      toast.error('You cannot rate your own movie');
      return;
    }

    try {
      const ratingData = {
        value: rating,
        timestamp: Date.now(),
      };

      await update(ref(db, `movies/${movieId}/ratings/${user.id}`), {
        [Date.now()]: ratingData,
      });
      toast.success('Rating added successfully');
    } catch (error) {
      toast.error('Failed to add rating');
      console.error('Error adding rating:', error);
    }
  };

  const formatCategory = (category: string) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const totalPages = Math.ceil(movies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMovies = movies.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <button
        onClick={() => setIsListVisible(!isListVisible)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Film className="w-6 h-6 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-800">Movie List</h2>
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
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'latest' | 'rating')}
              className="text-sm border rounded-lg py-1.5 px-2"
            >
              <option value="latest">Latest</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          <div className="space-y-4">
            {movies.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No movies added yet</p>
            ) : (
              <>
                {currentMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className="border rounded-lg p-4 hover:shadow-md transition duration-200"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="text-base font-medium text-gray-800">{movie.title}</h3>
                        {user && (
                          <button
                            onClick={() => handleDelete(movie.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete movie"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-semibold text-yellow-700 text-sm">
                            {calculateAverageRating(movie)}/10
                          </span>
                        </div>
                        <div className={`px-3 py-1.5 rounded-full ${categoryColors[movie.category].bg}`}>
                          <span className={`text-sm font-medium ${categoryColors[movie.category].text}`}>
                            {formatCategory(movie.category)}
                          </span>
                        </div>
                        <div className="px-3 py-1.5 rounded-full bg-purple-50">
                          <span className="text-sm font-medium text-purple-700">
                            {movie.language.charAt(0).toUpperCase() + movie.language.slice(1)}
                          </span>
                        </div>
                        <div className="px-3 py-1.5 rounded-full bg-red-50">
                          <span className="text-sm font-medium text-red-700">
                            {movie.ageRating}
                          </span>
                        </div>
                      </div>

                      {user && user.id !== movie.userId && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">Your Rating:</p>
                          <div className="flex gap-1">
                            {[...Array(10)].map((_, i) => {
                              const userRating = movie.ratings?.[user.id];
                              const lastRating = userRating ? 
                                Object.values(userRating).sort((a, b) => b.timestamp - a.timestamp)[0]?.value 
                                : null;
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => handleRating(movie.id, i + 1)}
                                  className={ratingButtonClass(lastRating === i + 1)}
                                  title={`Rate ${i + 1}`}
                                >
                                  {i + 1}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{movie.username}</span>
                        </div>
                        <span>•</span>
                        <span>{movie.year}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(movie.timestamp, { addSuffix: true })}</span>
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