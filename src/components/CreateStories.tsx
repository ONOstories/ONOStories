import React, { useState } from "react";
import {
  Upload,
  BookOpen,
  Download,
  Trash2,
  Plus,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import { mockGeneratedStories } from "../lib/mockData";

/* ---------- type definitions ---------- */
interface Story {
  id: number;
  title: string;
  genre: string;
  createdAt: string;
  thumbnail: string;
}

/* ---------- component ---------- */
export function CreateStories() {
  const [activeTab, setActiveTab] =
    useState<"create" | "history" | "photos">("create");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [storyForm, setStoryForm] = useState({
    childName: "",
    genre: "",
    subGenre: "",
    customGenre: "",
  });

  /* --- genre presets --- */
  const genres: Record<string, string[]> = {
    Educational: [
      "Science Adventures",
      "History Explorers",
      "Math Magic",
      "Geography Quest",
      "Custom Educational",
    ],
    "Bedtime Stories": [
      "Peaceful Dreams",
      "Sleepy Animals",
      "Night Sky Adventures",
      "Cozy Tales",
      "Custom Bedtime",
    ],
    "Moral Stories": [
      "Kindness Chronicles",
      "Honesty Heroes",
      "Sharing Stories",
      "Courage Tales",
      "Custom Moral",
    ],
  };

  /* --- story history (localStorage + mock) --- */
  const [generatedStories, setGeneratedStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem("onostories_generated_stories");
    return saved
      ? (JSON.parse(saved) as Story[])
      : mockGeneratedStories.map(
          (story): Story => ({
            id: parseInt(story.id, 10),
            title: story.title,
            genre: story.genre,
            createdAt: story.created_at.split("T")[0],
            thumbnail:
              "https://images.pexels.com/photos/220201/pexels-photo-220201.jpeg?auto=compress&cs=tinysrgb&w=400",
          })
        );
  });

  /* ---------- handlers ---------- */
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos = Array.from(files)
      .slice(0, 5 - uploadedPhotos.length)
      .map((file) => URL.createObjectURL(file));

    setUploadedPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (index: number) =>
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));

  const handleCreateStory = () => {
    if (!storyForm.childName || !storyForm.genre || uploadedPhotos.length === 0) {
      alert("Please fill in all required fields and upload at least one photo.");
      return;
    }

    const newStory: Story = {
      id: Date.now(),
      title: `${storyForm.childName}'s ${
        storyForm.subGenre || storyForm.genre
      } Adventure`,
      genre: storyForm.genre,
      createdAt: new Date().toISOString().split("T")[0],
      thumbnail:
        "https://images.pexels.com/photos/220201/pexels-photo-220201.jpeg?auto=compress&cs=tinysrgb&w=400",
    };

    const updated = [...generatedStories, newStory];
    setGeneratedStories(updated);
    localStorage.setItem("onostories_generated_stories", JSON.stringify(updated));

    /* reset */
    setStoryForm({ childName: "", genre: "", subGenre: "", customGenre: "" });
    setUploadedPhotos([]);

    alert(
      `Story "${newStory.title}" has been created! Check your Story History tab.`
    );
  };

  const handleDownloadStory = (storyId: number) => {
    const story = generatedStories.find((s) => s.id === storyId);
    alert(
      `Downloading "${story?.title}" as PDF. In a real app, this would generate and download the PDF file.`
    );
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Story Creation
          </h1>
          <p className="text-xl text-gray-600">
            Create and manage your child's personalized stories
          </p>
        </div>

        {/* tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          {/* tab buttons */}
          <div className="flex border-b border-gray-200">
            {[
              { id: "create", label: "Create Story", icon: Plus },
              { id: "history", label: "Story History", icon: BookOpen },
              { id: "photos", label: "Manage Photos", icon: ImageIcon },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as "create" | "history" | "photos")}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? "text-purple-600 border-b-2 border-purple-600 bg-purple-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* tab panels */}
          <div className="p-8">
            {/* ---------- CREATE TAB ---------- */}
            {activeTab === "create" && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Create New Story
                </h3>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* form controls */}
                  <div className="space-y-6">
                    {/* Child name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Child&apos;s Name *
                      </label>
                      <input
                        type="text"
                        value={storyForm.childName}
                        onChange={(e) =>
                          setStoryForm({ ...storyForm, childName: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your child's name"
                      />
                    </div>

                    {/* Genre */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Story Genre *
                      </label>
                      <select
                        value={storyForm.genre}
                        onChange={(e) =>
                          setStoryForm({
                            ...storyForm,
                            genre: e.target.value,
                            subGenre: "",
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select a genre</option>
                        {Object.keys(genres).map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sub-genre */}
                    {storyForm.genre && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sub-Genre
                        </label>
                        <select
                          value={storyForm.subGenre}
                          onChange={(e) =>
                            setStoryForm({ ...storyForm, subGenre: e.target.value })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select a sub-genre</option>
                          {genres[storyForm.genre].map((sg) => (
                            <option key={sg} value={sg}>
                              {sg}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Custom genre description */}
                    {storyForm.subGenre?.includes("Custom") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Custom Genre Description
                        </label>
                        <textarea
                          value={storyForm.customGenre}
                          onChange={(e) =>
                            setStoryForm({
                              ...storyForm,
                              customGenre: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          rows={3}
                          placeholder="Describe the type of story you'd like..."
                        />
                      </div>
                    )}
                  </div>

                  {/* photo upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Child Photos * ({uploadedPhotos.length}/5)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                      <input
                        id="photo-upload"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploadedPhotos.length >= 5}
                      />
                      <label
                        htmlFor="photo-upload"
                        className={`cursor-pointer ${
                          uploadedPhotos.length >= 5
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                          {uploadedPhotos.length >= 5
                            ? "Maximum 5 photos uploaded"
                            : "Click to upload photos (up to 5)"}
                        </p>
                      </label>
                    </div>

                    {/* thumbnails */}
                    {uploadedPhotos.length > 0 && (
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        {uploadedPhotos.map((photo, idx) => (
                          <div key={idx} className="relative">
                            <img
                              src={photo}
                              alt={`Child photo ${idx + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => removePhoto(idx)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* generate story CTA */}
                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleCreateStory}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center space-x-2"
                  >
                    <Sparkles className="h-5 w-5" />
                    <span>Generate Story</span>
                  </button>
                </div>
              </div>
            )}

            {/* ---------- HISTORY TAB ---------- */}
            {activeTab === "history" && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Your Stories
                </h3>

                {generatedStories.length === 0 ? (
                  /* empty state */
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-xl font-medium text-gray-600 mb-2">
                      No stories yet
                    </h4>
                    <p className="text-gray-500 mb-6">
                      Create your first personalized story!
                    </p>
                    <button
                      onClick={() => setActiveTab("create")}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all"
                    >
                      Create Story
                    </button>
                  </div>
                ) : (
                  /* story cards */
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {generatedStories.map((story: Story) => (
                      <div
                        key={story.id}
                        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
                      >
                        <img
                          src={story.thumbnail}
                          alt={story.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full">
                              {story.genre}
                            </span>
                            <span className="text-sm text-gray-500">
                              {story.createdAt}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 mb-4">
                            {story.title}
                          </h4>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => alert(`Viewing ${story.title}`)}
                              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                            >
                              View
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
                  </div>
                )}
              </div>
            )}

            {/* ---------- PHOTOS TAB ---------- */}
            {activeTab === "photos" && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Manage Photos
                </h3>
                <p className="text-gray-600 mb-6">
                  Upload and manage your child's photos for story generation. You
                  can upload up to 5 photos.
                </p>

                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="text-center">
                    <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      This feature allows you to manage all uploaded photos in one
                      place
                    </p>
                    <p className="text-sm text-gray-500">
                      Photos are used to create consistent character
                      representations across all stories
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* ---------- /PHOTOS TAB ---------- */}
          </div>
        </div>
      </div>
    </div>
  );
}
