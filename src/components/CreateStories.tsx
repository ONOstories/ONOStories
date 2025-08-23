import React, { useState, ChangeEvent, FormEvent } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Upload, Trash2, Sparkles, Loader2, User, BookOpen, Camera } from "lucide-react";

export const CreateStories: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [storyForm, setStoryForm] = useState({
    title: "",
    childName: "",
    age: "",
    gender: "",
    genre: "",
    short_description: "",
  });

  const handlePhotoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setUploadedPhoto(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
  };
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setStoryForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateStory = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to create a story.");
      return;
    }
    if (!storyForm.title || !storyForm.childName || !storyForm.age || !storyForm.gender || !storyForm.genre || !uploadedPhoto) {
      toast.error("Please fill in all required fields and upload a photo.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Upload photo
      const fileExt = uploadedPhoto.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('child-photos').upload(filePath, uploadedPhoto);
      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage.from('child-photos').getPublicUrl(filePath);
      if (!publicUrl) throw new Error("Could not get public URL for the photo.");

      // 3. Insert story record to get an ID
      const { data: storyData, error: insertError } = await supabase
        .from('stories')
        .insert({
          user_id: user.id,
          title: storyForm.title,
          child_name: storyForm.childName,
          age: parseInt(storyForm.age, 10),
          gender: storyForm.gender,
          genre: storyForm.genre,
          short_description: storyForm.short_description,
          photo_url: publicUrl,
          status: 'pending',
        })
        .select('id')
        .single();
      
      if (insertError) throw insertError;
      if (!storyData?.id) throw new Error("Failed to create story record.");

      // 4. Navigate to the loading page with the new story ID
      navigate('/creating-story', { state: { storyId: storyData.id } });

    } catch (error: any) {
      console.error("Error starting story creation:", error);
      toast.error(`Failed to start: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-4">
            Weave Your Story
          </h1>
          <p className="text-xl text-gray-600">
            Fill in the details below and watch the magic unfold.
          </p>
        </div>

        <form onSubmit={handleCreateStory} className="bg-white rounded-2xl shadow-2xl shadow-purple-100 p-8 space-y-10">
          
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-full"><User className="h-6 w-6 text-purple-600" /></div>
              <h2 className="text-2xl font-semibold text-gray-800">About the Hero</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Child's Name *</label>
                <input type="text" name="childName" value={storyForm.childName} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="e.g., Lily" />
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                  <input type="number" name="age" value={storyForm.age} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="3-12" min="3" max="12" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                  <select name="gender" value={storyForm.gender} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500">
                    <option value="">Select...</option>
                    <option value="boy">Boy</option>
                    <option value="girl">Girl</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-pink-100 p-2 rounded-full"><BookOpen className="h-6 w-6 text-pink-600" /></div>
              <h2 className="text-2xl font-semibold text-gray-800">Story Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Story Title *</label>
                <input type="text" name="title" value={storyForm.title} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500" placeholder="e.g., The Magical Seed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Story Genre *</label>
                <select name="genre" value={storyForm.genre} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500">
                  <option value="">Select a genre</option>
                  <option value="Educational">Educational</option>
                  <option value="Bedtime">Bedtime</option>
                  <option value="Moral">Moral</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">A short idea for the story</label>
              <textarea name="short_description" value={storyForm.short_description} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500" rows={4} placeholder="e.g., A shy firefly learns to let his light shine." />
            </div>
          </div>

          <div className="space-y-6">
             <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-full"><Camera className="h-6 w-6 text-orange-600" /></div>
              <h2 className="text-2xl font-semibold text-gray-800">Add The Main Character</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Child's Photo *</label>
              {photoPreview ? (
                <div className="relative group">
                  <img src={photoPreview} alt="Child preview" className="w-full h-80 object-cover rounded-xl shadow-md" />
                  <button type="button" onClick={removePhoto} className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100" disabled={isLoading}>
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                  <input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoSelect} className="hidden" disabled={isLoading} />
                  <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                    <span className="font-semibold text-purple-600">Click to upload a photo</span>
                    <span className="text-xs text-gray-500 mt-1">PNG, JPG, or WEBP</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center pt-6 border-t border-gray-200">
            <button type="submit" disabled={isLoading} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-transform hover:scale-105 shadow-lg flex items-center space-x-3 disabled:opacity-60 disabled:cursor-not-allowed">
              {isLoading ? (<Loader2 className="h-6 w-6 animate-spin" />) : (<Sparkles className="h-6 w-6" />)}
              <span>{isLoading ? "Preparing..." : "Generate Magic"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};