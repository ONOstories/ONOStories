import { useState } from 'react';
import { useAuth } from '../contexts/AuthProvider';
import { toast } from 'sonner';

const ProfileDropdown = ({ close, mobile = false }: { close: () => void; mobile?: boolean }) => {
  const { profile, setProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.name || '');
  const [gender, setGender] = useState(profile?.gender || '');

  const handleSave = async () => {
    const res = await fetch('/edge/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, gender }),
    });

    if (res.ok) {
      const { profile: updatedProfile } = await res.json();
      setProfile(updatedProfile);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      close(); // Close dropdown on successful save
    } else {
      toast.error('Failed to update profile.');
    }
  };

  const handleLogout = async () => {
    await logout();
    close(); // Close dropdown after logout
  };

  // MODIFICATION: Conditional classes for positioning
  const containerClasses = mobile
    ? "w-full bg-white rounded-lg shadow-lg p-4 mt-2" // In-flow block for mobile
    : "absolute top-12 right-0 w-72 bg-white rounded-lg shadow-lg p-4 z-50"; // Absolute for desktop

  return (
    <div className={containerClasses}>
      <div className="flex flex-col space-y-4">
        <div>
          {/* MODIFICATION: Changed "Username" to "Name" */}
          <label className="text-sm font-medium text-gray-500">Name</label>
          {isEditing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          ) : (
            <div className="flex justify-between items-center">
              <p>{profile?.name}</p>
              <button onClick={() => setIsEditing(true)} className="text-sm text-blue-500">Edit</button>
            </div>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Gender</label>
          {isEditing ? (
            <select
              value={gender || ''}
              onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          ) : (
            <div className="flex justify-between items-center">
              <p>{profile?.gender}</p>
              <button onClick={() => setIsEditing(true)} className="text-sm text-blue-500">Edit</button>
            </div>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Email</label>
          <p>{profile?.email}</p>
        </div>
        {isEditing && (
          <div className="flex justify-end space-x-2">
            <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-gray-200 rounded-md">Cancel</button>
            <button onClick={handleSave} className="px-3 py-1 bg-blue-500 text-white rounded-md">Save</button>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;