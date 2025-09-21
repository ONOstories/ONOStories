import { useAuth } from "../contexts/AuthProvider";

const UsageBanner = () => {
  const { profile } = useAuth();
  if (!profile || profile.role !== "prouser") return null;

  // Determine if plan is annual or monthly
  let storiesLimit = 20, downloadsLimit = 10;
  if (profile.plan_expires_at) {
    // Plan expires in >60 days = annual
    const days = Math.round((new Date(profile.plan_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days > 60) {
      storiesLimit = 236;
      downloadsLimit = 120;
    }
  }

  return (
    <div className="my-4 rounded-xl bg-purple-100 text-purple-900 p-4 font-semibold text-md flex flex-col sm:flex-row sm:items-center sm:space-x-10 justify-center">
      <div>
        <b>Stories Generated:</b> {profile.stories_generated ?? 0} / {storiesLimit}
      </div>
      <div>
        <b>Downloads:</b> {profile.stories_downloaded ?? 0} / {downloadsLimit}
      </div>
      {/* <div>
        <b>Plan expires:</b> {profile.plan_expires_at ? new Date(profile.plan_expires_at).toLocaleDateString() : "unknown"}
      </div> */}
    </div>
  );
};

export default UsageBanner;
