import { useState } from "react";
import { useNavigate } from "react-router-dom";

// import { SignupLogin } from "../SignupForm";
import { LoginForm } from "../LoginForm";

export default function SignupLoginPage() {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const navigate = useNavigate();              // ← react-router

  /* fake auth success → go to home route */
  const onAuthSuccess = () => navigate("/");

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 px-4">
      <div className="w-full max-w-md">
        {mode === "signup" ? (
          <>
            {/* <SignupLogin onSuccess={onAuthSuccess} /> */}
            <p className="mt-6 text-center text-sm text-[#4C1D95]">
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="font-semibold underline hover:text-[#2E1065]"
              >
                Log&nbsp;in
              </button>
            </p>
          </>
        ) : (
          <>
            <LoginForm onSuccess={onAuthSuccess} />
            <p className="mt-6 text-center text-sm text-[#4C1D95]">
              New here?{" "}
              <button
                onClick={() => setMode("signup")}
                className="font-semibold underline hover:text-[#2E1065]"
              >
                Create&nbsp;an&nbsp;account
              </button>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
