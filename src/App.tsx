import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Film } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import MovieForm from './components/MovieForm';
import MovieList from './components/MovieList';
import TVSeriesList from './components/TVSeriesList';
import TopMovies from './components/TopMovies';
import TopTVSeries from './components/TopTVSeries';
import UserProfile from './components/UserProfile';

export default function App() {
  return (
    <AuthProvider>
      <div className="background-shapes">
        <div className="min-h-screen backdrop-blur-sm py-8">
          <div className="container mx-auto px-4 max-w-lg">
            <header className="flex flex-col gap-4 mb-6">
              <div className="flex items-center justify-center gap-2 bg-white/10 p-4 rounded-lg backdrop-blur-md">
                <Film className="w-8 h-8 text-white" />
                <h1 className="text-3xl font-bold text-white">Movie Ratings</h1>
              </div>
              <UserProfile />
            </header>

            <div className="space-y-6">
              <MovieForm />
              <MovieList />
              <TVSeriesList />
              <TopMovies />
              <TopTVSeries />
            </div>
          </div>
          <Toaster 
            position="bottom-center"
            toastOptions={{
              duration: 2000,
              style: {
                maxWidth: '90vw',
                margin: '0 auto 64px auto',
              },
            }} 
          />
        </div>
      </div>
    </AuthProvider>
  );
}