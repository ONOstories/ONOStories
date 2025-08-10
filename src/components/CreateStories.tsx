import React, { useState, ChangeEvent, FormEvent } from "react";
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

// The component for creating new stories, now with enhanced debugging.
export const CreateStories: React.FC = () => {
  const { user, profile } = useAuth();
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

  // Redirect non-pro users to the pricing page
  if (profile && profile.role !== "prouser") {
    navigate("/pricing", { state: { animatePro: true } });
    return (
      <div className="min-h-screen flex items-center justify-center">
        Redirecting to pricing...
      </div>
    );
  }

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

  // Main function to handle story creation with detailed logging
  const handleCreateStory = async (e: FormEvent) => {
    e.preventDefault();
    // Validation checks
    if (!user) {
      toast.error("You must be logged in to create a story.");
      return;
    }
    if (!storyForm.title || !storyForm.childName || !storyForm.age || !storyForm.gender || !storyForm.genre || !storyForm.short_description || !uploadedPhoto) {
      toast.error("Please fill in all the required fields and upload a photo.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Starting story creation...");

    try {
      console.log("[DEBUG] handleCreateStory started.");

      // STEP 1: UPLOAD PHOTO
      console.log("[DEBUG] Step 1: Uploading photo...");
      toast.info("Uploading child's photo...", { id: toastId });
      const fileExt = uploadedPhoto.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('child-photos')
        .upload(filePath, uploadedPhoto);

      if (uploadError) {
        console.error("[DEBUG] Photo upload failed.", uploadError);
        throw uploadError;
      }
      console.log("[DEBUG] Step 1 SUCCESS: Photo uploaded.");

      // STEP 2: GET PUBLIC URL (Safer method)
      console.log("[DEBUG] Step 2: Getting public URL for the photo...");
      const { data: urlData } = supabase.storage
        .from('child-photos')
        .getPublicUrl(filePath);

      if (!urlData || !urlData.publicUrl) {
          throw new Error("Could not get public URL for the uploaded photo.");
      }
      const publicUrl = urlData.publicUrl;
      console.log("[DEBUG] Step 2 SUCCESS: Got public URL:", publicUrl);

      // STEP 3: INSERT STORY RECORD
      console.log("[DEBUG] Step 3: Preparing to insert story record...");
      toast.info("Creating story record...", { id: toastId });
      const storyToInsert = {
          user_id: user.id,
          title: storyForm.title,
          child_name: storyForm.childName,
          age: parseInt(storyForm.age, 10),
          gender: storyForm.gender,
          genre: storyForm.genre,
          short_description: storyForm.short_description,
          photo_url: publicUrl,
          pages: [ // Mocked pages for PDF generation
            { page_number: 1, content: `Once upon a time, in a land of wonder, lived a child named ${storyForm.childName}.`, illustration_prompt: `A cute child named ${storyForm.childName} in a magical forest, cartoon style` },
            { page_number: 2, content: `One day, ${storyForm.childName} discovered a hidden path that shimmered with light.`, illustration_prompt: `A child, ${storyForm.childName}, standing at the entrance of a glowing path in a forest, children's storybook illustration` }
          ],
        };
      console.log("[DEBUG] Story object to insert:", storyToInsert);

      const { data: storyData, error: insertError } = await supabase
        .from('stories')
        .insert(storyToInsert)
        .select()
        .single();
      
      if (insertError) {
          console.error("[DEBUG] Database insert failed.", insertError);
          throw insertError;
      }
      console.log("[DEBUG] Step 3 SUCCESS: Story inserted with ID:", storyData.id);

      const storyId = storyData.id;

      // STEP 4: INVOKE EDGE FUNCTION
      console.log(`[DEBUG] Step 4: Invoking 'create-storybook' function with storyId: ${storyId}`);
      toast.info("Generating illustrations and PDF...", { id: toastId });
      const { data: functionData, error: functionError } = await supabase.functions.invoke('create-storybook', {
        body: { storyId, userId: user.id },
      });

      if (functionError) {
        console.error("[DEBUG] Function invocation failed.", functionError);
        throw functionError;
      }
      console.log("[DEBUG] Step 4 SUCCESS: Function invoked. Response:", functionData);

      if (functionData.error) {
        throw new Error(`The function ran but returned an error: ${functionData.error}`);
      }

      // STEP 5: OPEN PDF
      console.log("[DEBUG] Step 5: Opening PDF...");
      toast.success("Your storybook is ready! Opening now...", { id: toastId });
      window.open(functionData.pdfUrl, '_blank');
      console.log("[DEBUG] Step 5 SUCCESS: PDF opened.");

    } catch (error: any) {
      console.error("--- STORY CREATION FAILED ---");
      console.error("Error Message:", error.message);
      console.error("Full Error Object:", error);
      toast.error(`Failed to create story: ${error.message}`, { id: toastId });
    } finally {
      setIsLoading(false);
      console.log("[DEBUG] handleCreateStory finished.");
    }
  };

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

        <form onSubmit={handleCreateStory} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column: Form Inputs */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Story Title *</label>
                <input
                  type="text" name="title" value={storyForm.title} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Leo the Brave Lion"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Child's Name *</label>
                <input
                  type="text" name="childName" value={storyForm.childName} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your child's name"
                />
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                  <input
                    type="number" name="age" value={storyForm.age} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="3-12" min="3" max="12"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                  <select
                    name="gender" value={storyForm.gender} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="boy">Boy</option>
                    <option value="girl">Girl</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Story Genre *</label>
                <select
                  name="genre" value={storyForm.genre} onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a genre</option>
                  <option value="Educational">Educational</option>
                  <option value="Bedtime">Bedtime</option>
                  <option value="Moral">Moral</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Short Description *</label>
                <textarea
                  name="short_description" value={storyForm.short_description} onChange={handleChange}
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
                    type="button" onClick={removePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    id="photo-upload" type="file" accept="image/*" onChange={handlePhotoSelect}
                    className="hidden" disabled={isLoading}
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

          <div className="flex justify-center mt-8 pt-8 border-t">
            <button
              type="submit" disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (<Loader2 className="h-6 w-6 animate-spin" />) : (<Sparkles className="h-6 w-6" />)}
              <span>{isLoading ? "Creating..." : "Generate Story"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
