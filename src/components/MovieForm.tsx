import React, { useState } from 'react';
import { ref, push } from 'firebase/database';
import { db } from '../firebase';
import { Film, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

type MovieCategory = 'must-watch' | 'good' | 'one-time-watch' | 'bad';
type Language = 'hindi' | 'telugu' | 'tamil' | 'malayalam' | 'english' | 'foreign';
type AgeRating = '18+' | 'under18';
type ContentType = 'movie' | 'tv-series';

const ratingButtonClass = (isSelected: boolean) => `
  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
  ${isSelected 
    ? 'bg-indigo-600 text-white' 
    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} 
  transition-colors duration-200
`;

export default function MovieForm() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState<ContentType>('movie');
  const [year, setYear] = useState(new Date().getFullYear());
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState<MovieCategory>('good');
  const [language, setLanguage] = useState<Language>('hindi');
  const [ageRating, setAgeRating] = useState<AgeRating>('under18');
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to add a movie');
      return;
    }

    const movieData = {
      title,
      contentType,
      year,
      rating: Number(rating),
      category,
      language,
      ageRating,
      timestamp: Date.now(),
      userId: user.id,
      username: user.username,
    };

    try {
      await push(ref(db, 'movies'), movieData);
      setTitle('');
      setContentType('movie');
      setYear(new Date().getFullYear());
      setRating(5);
      setCategory('good');
      setLanguage('hindi');
      setAgeRating('under18');
      setIsFormVisible(false);
      toast.success('Content added successfully!');
    } catch (error) {
      toast.error('Error adding content');
      console.error('Error adding content:', error);
    }
  };

  // Generate year options from 1900 to current year
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <button
        onClick={() => setIsFormVisible(!isFormVisible)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Film className="w-6 h-6 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-800">Add New Content</h2>
        </div>
        {isFormVisible ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isFormVisible && (
        <form onSubmit={handleSubmit} className="p-5 border-t space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border text-base"
              required
            />
          </div>

          <div>
            <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="contentType"
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border text-base"
              required
            >
              <option value="movie">Movie</option>
              <option value="tv-series">TV Series</option>
            </select>
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Release Year
            </label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border text-base"
              required
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating (1-10)
            </label>
            <div className="flex gap-1 flex-wrap">
              {[...Array(10)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className={ratingButtonClass(rating === i + 1)}
                  title={`Rate ${i + 1}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Verdict
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as MovieCategory)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border text-base"
              required
            >
              <option value="must-watch">Must Watch</option>
              <option value="good">Good</option>
              <option value="one-time-watch">One Time Watch</option>
              <option value="bad">Bad</option>
            </select>
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border text-base"
              required
            >
              <option value="hindi">Hindi</option>
              <option value="telugu">Telugu</option>
              <option value="tamil">Tamil</option>
              <option value="malayalam">Malayalam</option>
              <option value="english">English</option>
              <option value="foreign">Foreign</option>
            </select>
          </div>

          <div>
            <label htmlFor="ageRating" className="block text-sm font-medium text-gray-700 mb-1">
              Adult Content
            </label>
            <select
              id="ageRating"
              value={ageRating}
              onChange={(e) => setAgeRating(e.target.value as AgeRating)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2.5 border text-base"
              required
            >
              <option value="under18">Under 18</option>
              <option value="18+">18+</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium mt-2"
            disabled={!user}
          >
            {user ? 'Add Content' : 'Sign in to Add Content'}
          </button>
        </form>
      )}
    </div>
  );
}