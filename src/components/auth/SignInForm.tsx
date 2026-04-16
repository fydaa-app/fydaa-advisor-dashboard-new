"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label"; 
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState, FormEvent, useRef } from "react";
import { setCookie } from "cookies-next";
import { useAuth } from "@/context/AuthContext";
import { login as loginService } from "@/services";

export default function SignInForm() {
  // State for form inputs and UI
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  
  // State for error handling and loading
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Refs for form elements
  const formRef = useRef<HTMLFormElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  
  // Auth context
  const { login } = useAuth();

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const emailValue = emailInputRef.current?.value || email;
      const passwordValue = passwordInputRef.current?.value || password;

      if (!emailValue || !passwordValue) {
        setError("Please enter both email and password");
        setIsLoading(false);
        return;
      }

      // Perform login API call
      const data = await loginService(emailValue, passwordValue);

      // Set cookie with appropriate expiration
      const expiresIn = isChecked ? 30 : 1;
      setCookie("authToken", data.token, { 
        maxAge: expiresIn * 24 * 60 * 60,
        path: "/",
        sameSite: "lax"
      });

      // Transform advisor data to Employee format
      // Use role and isAdmin directly from API response
      const role = data.advisor.role || "advisor";
      const isAdmin = data.advisor.isAdmin || false;

      // Map advisor to Employee format
      const employeeData = {
        id: data.advisor.id,
        name: data.advisor.name,
        email: data.advisor.email,
        role: role,
        isAdmin: isAdmin
      };

      // Store full advisor data in localStorage for profile page
      localStorage.setItem('advisorData', JSON.stringify({
        id: data.advisor.id,
        name: data.advisor.name,
        email: data.advisor.email,
        mobile: data.advisor.mobile,
        experienceInYears: data.advisor.experienceInYears,
        role: role,
        isAdmin: isAdmin
      }));

      // Update auth context (this will handle navigation)
      login(data.token, employeeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };


  // Function to trigger form submission programmatically
  const submitForm = () => {
    if (!isLoading && formRef.current) {
      formRef.current.dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">      
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>
          <div>            
            
            <form ref={formRef} onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 text-sm text-error-500 bg-error-50 p-3 rounded">
                  {error}
                </div>
              )}
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative flex">
                    <div className="flex-1 z-10">
                      <Input 
                        ref={emailInputRef}
                        placeholder="info@gmail.com" 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative flex">
                    <div className="flex-1 z-10">
                      <Input
                        ref={passwordInputRef}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={isChecked} 
                      onChange={setIsChecked} 
                    />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    href="/forgotpassword"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <button
                    onClick={submitForm}
                    disabled={isLoading}
                    className="w-full inline-flex items-center justify-center bg-brand-500 text-white hover:bg-brand-600 
                              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 px-4 py-2 
                              rounded-lg text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                    type="button"
                  >
                    {isLoading ? "Signing In..." : "Sign in"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}