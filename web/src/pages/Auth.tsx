import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  auth,
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "../firebase";
import { updateProfile } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import GeometricIllustration from "../components/GeometricIllustration";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";

type AuthMode = "login" | "signup";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

interface LocationState {
  from?: { pathname: string };
}

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  // Mouse position for interactive illustration
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  // Get the intended destination
  const from =
    (location.state as LocationState)?.from?.pathname || "/form/personal";

  // Track mouse movement across ENTIRE page for 360-degree tracking
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (mode === "signup" && !name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (mode === "signup") {
      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        if (userCredential.user && name) {
          await updateProfile(userCredential.user, { displayName: name });
        }
        setSuccessMessage("Account created successfully!");
        setTimeout(() => navigate(from, { replace: true }), 1500);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccessMessage("Login successful!");
        setTimeout(() => navigate(from, { replace: true }), 1500);
      }
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      let errorMessage = "An error occurred. Please try again.";

      switch (firebaseError.code) {
        case "auth/email-already-in-use":
          errorMessage = "This email is already registered";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/weak-password":
          errorMessage = "Password is too weak";
          break;
        case "auth/user-not-found":
          errorMessage = "No account found with this email";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password";
          break;
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password";
          break;
        default:
          errorMessage = firebaseError.message || errorMessage;
      }

      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      await signInWithPopup(auth, googleProvider);
      setSuccessMessage("Login successful!");
      setTimeout(() => navigate(from, { replace: true }), 1500);
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      if (firebaseError.code !== "auth/popup-closed-by-user") {
        setErrors({
          general: firebaseError.message || "Google sign-in failed",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setErrors({});
    setSuccessMessage("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotPasswordEmail.trim()) {
      setErrors({ general: "Please enter your email address" });
      return;
    }

    if (!validateEmail(forgotPasswordEmail)) {
      setErrors({ general: "Please enter a valid email address" });
      return;
    }

    setForgotPasswordLoading(true);
    setErrors({});

    try {
      await sendPasswordResetEmail(auth, forgotPasswordEmail);
      setSuccessMessage("Password reset link sent! Check your email.");
      setShowForgotPassword(false);
      setForgotPasswordEmail("");
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };
      let errorMessage = "Failed to send reset email. Please try again.";

      switch (firebaseError.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many requests. Please try again later.";
          break;
        default:
          errorMessage = firebaseError.message || errorMessage;
      }

      setErrors({ general: errorMessage });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Left Side - Illustration (exactly 50%) */}
      <div className="hidden md:flex flex-shrink-0 items-center justify-center" style={{ width: '50%' }}>
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <GeometricIllustration
            mouseX={mousePos.x}
            mouseY={mousePos.y}
            eyesClosed={showPassword || showConfirmPassword}
          />
        </div>
      </div>

      {/* Right Side - Auth Form (exactly 50%) */}
      <div className="flex-1 md:flex-shrink-0 flex items-center justify-center bg-white px-6 py-6 overflow-auto" style={{ width: '50%' }}>
        <div className="w-full max-w-sm space-y-5">
          {/* Plus Icon */}
          <div className="flex justify-center">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === "login" ? "Welcome back!" : "Create account"}
            </h1>
            <p className="text-gray-500">
              {mode === "login"
                ? "Please enter your details"
                : "Fill in your information to get started"}
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-700 text-center text-sm font-medium">
                {successMessage}
              </p>
            </div>
          )}

          {/* Error Message */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-center text-sm">
                {errors.general}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Name Field - Signup Only */}
            {mode === "signup" && (
              <AuthInput
                id="name"
                type="text"
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="your full name"
                error={errors.name}
              />
            )}

            {/* Email Field */}
            <AuthInput
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="EMAIL_ADDRESS"
              error={errors.email}
            />

            {/* Password Field */}
            <AuthInput
              id="password"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              error={errors.password}
              showPasswordToggle
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />

            {/* Confirm Password - Signup Only */}
            {mode === "signup" && (
              <AuthInput
                id="confirmPassword"
                type="password"
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                error={errors.confirmPassword}
                showPasswordToggle
                showPassword={showConfirmPassword}
                onTogglePassword={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              />
            )}

            {/* Remember Me & Forgot Password - Login Only */}
            {mode === "login" && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">
                    Remember for 30 days
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setForgotPasswordEmail(email);
                    setErrors({});
                    setSuccessMessage("");
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <AuthButton type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </>
              ) : mode === "login" ? (
                "Log in"
              ) : (
                "Sign up"
              )}
            </AuthButton>

            {/* Google Sign In */}
            <AuthButton
              variant="outline"
              onClick={handleGoogleAuth}
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Log in with Google
            </AuthButton>
          </form>

          {/* Toggle Mode */}
          <p className="text-center text-sm text-gray-500">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-semibold text-gray-900 hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-semibold text-gray-900 hover:underline"
                >
                  Log in
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Reset Password</h2>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setErrors({});
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-gray-500 text-sm mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl mb-4">
                <p className="text-red-600 text-center text-sm">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <AuthInput
                id="forgotEmail"
                type="email"
                label="Email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder="suganthcl7@gmail.com"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setErrors({});
                  }}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotPasswordLoading}
                  className="flex-1 py-3 px-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {forgotPasswordLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
