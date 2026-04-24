import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/navbar";
import toast from "react-hot-toast";

function Profile() {
  const [user, setUser] = useState(null);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch {
      toast.error("Failed to load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050506] text-white">
        <Navbar />
        <main className="max-w-[1450px] mx-auto px-8 py-10">
          <p className="text-slate-400">Loading profile...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050506] text-white">
      <Navbar />

      <main className="max-w-[1450px] mx-auto px-8 py-10">
        <h1
          className="text-4xl mb-2"
          style={{
            fontFamily:
              '"The Seasons", "Cormorant Garamond", serif',
          }}
        >
          Profile
        </h1>

        <p className="text-slate-400 mb-8">
          Your personal information
        </p>

        <div className="max-w-xl bg-[#111417] border border-[#252a30] rounded-3xl p-8 shadow-xl space-y-6">
          
          <ProfileField
            label="Full Name"
            value={`${user.first_name} ${user.middle_name || ""} ${user.last_name}`}
          />

          <ProfileField label="Email" value={user.email} />

          <ProfileField label="Phone" value={user.phone} />

          <ProfileField label="Date of Birth" value={user.dob} />

        </div>
      </main>
    </div>
  );
}

function ProfileField({ label, value }) {
  return (
    <div>
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-lg mt-1">{value || "-"}</p>
    </div>
  );
}

export default Profile;