import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Upload,
  BookOpen,
  Trash2,
  Plus,
  ImageIcon,
  Sparkles,
  Loader2,
} from "lucide-react";

// The component for creating new stories, now fully integrated with Supabase.
export function CreateStories() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Expanded form state to include all required fields for the 'stories' table
  const [storyForm, setStoryForm] = useState({
    title: "",
    childName: "",
    age: "",
    gender: "",
    genre: "",
    short_description: "",
  });

  // Redirect non-pro users to the pricing page
  if (profile?.role !== "prouser") {
    navigate("/pricing", { state: { animatePro: true } });
    // Render a fallback while redirecting
    return (
      <div className="min-h-screen flex items-center justify-center">
        Redirecting to pricing...
      </div>
    );
  }

  // Handles the selection of a photo file
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // Removes the selected photo
  const removePhoto = () => {
    setUploadedPhoto(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
  };

  // Main function to handle story creation
  const handleCreateStory = async () => {
    // Basic form validation
    if (!storyForm.title || !storyForm.childName || !storyForm.age || !storyForm.gender || !storyForm.genre || !storyForm.short_description) {
      toast.error("Please fill in all the required fields.");
      return;
    }
    if (!uploadedPhoto) {
      toast.error("Please upload a photo of the child.");
      return;
    }
    if (!user) {
        toast.error("You must be logged in to create a story.");
        return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Generating your magical story... Please wait.");

    try {
      // 1. Upload the photo to Supabase Storage
      const fileExt = uploadedPhoto.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      // The path for the file within the bucket. No leading slash.
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('child-photos') // The name of the bucket
        .upload(filePath, uploadedPhoto);

      if (uploadError) {
        throw uploadError;
      }

      // 2. Get the public URL of the uploaded photo
      const { data: { publicUrl } } = supabase.storage
        .from('child-photos')
        .getPublicUrl(filePath);

      // 3. Insert the new story record into the 'stories' table
      const { error: insertError } = await supabase.from('stories').insert({
        user_id: user.id,
        title: storyForm.title,
        child_name: storyForm.childName,
        age: parseInt(storyForm.age, 10),
        gender: storyForm.gender,
        genre: storyForm.genre,
        short_description: storyForm.short_description,
        photo_url: publicUrl,
        // Status defaults to 'pending'
      });

      if (insertError) {
        throw insertError;
      }

      toast.success("Your story is being created! We'll notify you when it's ready.", {
        id: toastId,
      });

      // Redirect to the story library where the user will see the new story processing
      navigate("/story-library");

    } catch (error: any) {
      console.error("Error creating story:", error);
      toast.error(`Failed to create story: ${error.message}`, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  // UI for the story creation form
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Create a New Story
          </h1>
          <p className="text-xl text-gray-600">
            Fill in the details below to start the magic.
          </p>
        </div>

        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column: Form Inputs */}
            <div className="space-y-6">
              {/* Story Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Story Title *</label>
                <input
                  type="text"
                  value={storyForm.title}
                  onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Leo the Brave Lion"
                />
              </div>

              {/* Child's Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Child's Name *</label>
                <input
                  type="text"
                  value={storyForm.childName}
                  onChange={(e) => setStoryForm({ ...storyForm, childName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your child's name"
                />
              </div>

              {/* Age and Gender */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                  <input
                    type="number"
                    value={storyForm.age}
                    onChange={(e) => setStoryForm({ ...storyForm, age: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="3-12"
                    min="3"
                    max="12"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                  <select
                    value={storyForm.gender}
                    onChange={(e) => setStoryForm({ ...storyForm, gender: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="boy">Boy</option>
                    <option value="girl">Girl</option>
                  </select>
                </div>
              </div>

              {/* Story Genre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Story Genre *</label>
                <select
                  value={storyForm.genre}
                  onChange={(e) => setStoryForm({ ...storyForm, genre: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a genre</option>
                  <option value="Educational">Educational</option>
                  <option value="Bedtime">Bedtime</option>
                  <option value="Moral">Moral</option>
                </select>
              </div>

               {/* Short Description */}
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Short Description *</label>
                <textarea
                  value={storyForm.short_description}
                  onChange={(e) => setStoryForm({ ...storyForm, short_description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="e.g., A story about sharing toys with friends."
                />
              </div>
            </div>

            {/* Right Column: Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Child's Photo *</label>
              {photoPreview ? (
                <div className="relative">
                  <img src={photoPreview} alt="Child preview" className="w-full h-64 object-cover rounded-lg" />
                  <button
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Click to upload a photo</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP</p>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Generate Story Button */}
          <div className="flex justify-center mt-8 pt-8 border-t">
            <button
              onClick={handleCreateStory}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Sparkles className="h-6 w-6" />
              )}
              <span>{isLoading ? "Creating..." : "Generate Story"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
