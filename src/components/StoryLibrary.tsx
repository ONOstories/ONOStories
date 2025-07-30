import React from 'react';
import { BookOpen, Lock, Download, Eye, Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { demoStories, personalizedStories } from '../lib/mockData';

interface StoryLibraryProps {
  setCurrentPage: (page: string) => void;
}

export function StoryLibrary({ setCurrentPage }: StoryLibraryProps) {
  const { user, isPro } = useAuth();


  const handleViewStory = (storyId: string) => {
    // Simulate story viewing
    const story = demoStories.find(s => s.id === storyId);
    alert(`Opening "${story?.title}" story reader. In a real app, this would display the full interactive story.`);
  };

  const handleDownloadStory = (storyId: string) => {
    if (!isPro) {
      setCurrentPage('pricing');
      return;
    }
    // Simulate PDF download
    const story = personalizedStories.find(s => s.id === storyId);
    alert(`Downloading "${story?.title}" as PDF. In a real app, this would generate and download the PDF file.`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center px-4">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-purple-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Our Story Library</h2>
          <p className="text-xl text-gray-600 mb-8">Sign in to access our collection of magical stories</p>
          <button
            onClick={() => setCurrentPage('auth')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Story Library
          </h1>
          <p className="text-xl text-gray-600">
            {isPro ? "Enjoy unlimited personalized stories!" : "Explore our demo stories and upgrade for personalized adventures!"}
          </p>
        </div>

        {/* Demo Stories Section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Demo Stories</h2>
            <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-full">
              Free for everyone
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoStories.map((story) => (
              <div key={story.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={story.thumbnail}
                    alt={story.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">
                      {story.genre}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{story.rating}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{story.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{story.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Character: {story.character}</span>
                    <span>{story.duration}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewStory(story.id)}
                      className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Read Story</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personalized Stories Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Personalized Stories</h2>
            <div className="flex items-center space-x-2 text-sm text-purple-600 bg-purple-100 px-4 py-2 rounded-full">
              <Lock className="h-4 w-4" />
              <span>Pro Members Only</span>
            </div>
          </div>

          {!isPro ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Unlock Personalized Stories</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Upgrade to Pro to create unlimited personalized stories where your child becomes the main character. 
                Upload their photos and watch them embark on magical adventures!
              </p>
              <button
                onClick={() => setCurrentPage('pricing')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Upgrade to Pro
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personalizedStories.map((story) => (
                <div key={story.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                  <div className="h-48 bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                    <div className="text-center">
                      <BookOpen className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                      <p className="text-purple-800 font-medium">Your Child's Photo Here</p>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-gold-100 text-gold-800 text-xs font-medium px-3 py-1 rounded-full">
                        {story.genre}
                      </span>
                      <div className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                        Customizable
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{story.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{story.description}</p>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage('dashboard')}
                        className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Create Story
                      </button>
                      <button
                        onClick={() => handleDownloadStory(story.id)}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Create Custom Story Card */}
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl border-2 border-dashed border-purple-300 p-8 flex flex-col items-center justify-center text-center hover:border-purple-400 transition-colors cursor-pointer"
                   onClick={() => setCurrentPage('dashboard')}>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Create New Story</h3>
                <p className="text-gray-600 text-sm">
                  Start a new personalized adventure for your child
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}