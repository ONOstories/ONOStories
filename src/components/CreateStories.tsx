import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Upload,
  Trash2,
  Sparkles,
  Loader2,
} from "lucide-react";

export function CreateStories() {
  const { user, profile } = useAuth();
  const navigate          = useNavigate();

  const [isLoading,      setIsLoading]      = useState(false);
  const [uploadedPhoto,  setUploadedPhoto]  = useState<File | null>(null);
  const [photoPreview,   setPhotoPreview]   = useState<string | null>(null);
  const [storyForm,      setStoryForm]      = useState({
    title: "",
    childName: "",
    age: "",
    gender: "",
    genre: "",
    short_description: "",
  });

  /* ---------- Guard: route non-pro users to pricing ---------- */
  if (profile?.role !== "prouser") {
    navigate("/pricing", { state: { animatePro: true } });
    return (
      <div className="min-h-screen flex items-center justify-center">
        Redirecting to pricing…
      </div>
    );
  }

  /* ---------- File-input helpers ---------- */
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  /* ---------- Main submit handler ---------- */
  const handleCreateStory = async () => {
    // basic validation
    if (
      !storyForm.title            ||
      !storyForm.childName        ||
      !storyForm.age              ||
      !storyForm.gender           ||
      !storyForm.genre            ||
      !storyForm.short_description
    ) {
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
    const toastId = toast.loading("Generating your magical story…");

    try {
      /* ---------- 1. photo upload ---------- */
      const ext     = uploadedPhoto.name.split(".").pop();         // "jpg" / "png"
      const uuid    = crypto.randomUUID();                         // avoids collisions
      const path    = `child-photos/${uuid}.${ext}`;               // no leading slash

      const { error: uploadError } = await supabase.storage
        .from("child-photos")
        .upload(path, uploadedPhoto, {
          contentType : uploadedPhoto.type, // tells Storage the correct MIME type
          cacheControl: "3600",
          upsert      : false,
        });

      if (uploadError) throw uploadError;

      /* ---------- 2. public URL ---------- */
      const { data: { publicUrl } } = supabase.storage
        .from("child-photos")
        .getPublicUrl(path);

      /* ---------- 3. DB insert ---------- */
      const { error: insertError } = await supabase
        .from("stories")
        .insert({
          user_id         : user.id,
          title           : storyForm.title,
          child_name      : storyForm.childName,
          age             : parseInt(storyForm.age, 10),
          gender          : storyForm.gender,
          genre           : storyForm.genre,
          short_description: storyForm.short_description,
          photo_url       : publicUrl,
          // status defaults to "pending"
        });

      if (insertError) throw insertError;

      toast.success(
        "Your story is being created! We'll notify you when it's ready.",
        { id: toastId },
      );

      navigate("/story-library");
    } catch (err: any) {
      console.error("Error creating story:", err);
      toast.error(`Failed to create story: ${err.message}`, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        {/* header */}
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
            {/* ----- left column: form inputs ----- */}
            <div className="space-y-6">
              {/* title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Story Title *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Leo the Brave Lion"
                  value={storyForm.title}
                  onChange={e => setStoryForm({ ...storyForm, title: e.target.value })}
                />
              </div>

              {/* child name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Child's Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your child's name"
                  value={storyForm.childName}
                  onChange={e => setStoryForm({ ...storyForm, childName: e.target.value })}
                />
              </div>

              {/* age & gender */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                  <input
                    type="number"
                    min="3"
                    max="12"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="3-12"
                    value={storyForm.age}
                    onChange={e => setStoryForm({ ...storyForm, age: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={storyForm.gender}
                    onChange={e => setStoryForm({ ...storyForm, gender: e.target.value })}
                  >
                    <option value="">Select…</option>
                    <option value="boy">Boy</option>
                    <option value="girl">Girl</option>
                  </select>
                </div>
              </div>

              {/* genre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Story Genre *</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={storyForm.genre}
                  onChange={e => setStoryForm({ ...storyForm, genre: e.target.value })}
                >
                  <option value="">Select a genre</option>
                  <option value="Educational">Educational</option>
                  <option value="Bedtime">Bedtime</option>
                  <option value="Moral">Moral</option>
                </select>
              </div>

              {/* short description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Short Description *</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., A story about sharing toys with friends."
                  value={storyForm.short_description}
                  onChange={e => setStoryForm({ ...storyForm, short_description: e.target.value })}
                />
              </div>
            </div>

            {/* ----- right column: photo upload ----- */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Child's Photo *</label>
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Child preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    disabled={isLoading}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400">
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoSelect}
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

          {/* submit button */}
          <div className="flex justify-center mt-8 pt-8 border-t">
            <button
              type="button"
              onClick={handleCreateStory}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-pink-700 flex items-center space-x-3 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Sparkles className="h-6 w-6" />
              )}
              <span>{isLoading ? "Creating…" : "Generate Story"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
