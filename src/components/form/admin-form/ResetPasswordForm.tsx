"use client";
import React, { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Input from "../input/InputField";
import Button from "../../ui/button/Button";
import Label from "../Label";
import { EyeCloseIcon, EyeIcon } from "../../../icons";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { resetPassword } from "@/services";
import { useAuth } from "@/context/AuthContext";

interface ResetPasswordData {
  email: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPasswordForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Omit<ResetPasswordData, 'email'>>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate passwords match
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error("New password and confirm password don't match");
        return;
      }

      if (!user?.email) {
        toast.error("User email not found");
        return;
      }

      const result = await resetPassword(
        user.email,
        formData.oldPassword,
        formData.newPassword,
        formData.confirmPassword
      );

      if (!result.success) {
        toast.error(result.message || "Failed to reset password");
        return;
      }

      toast.success(result.message || "Password reset successfully");
      router.push('/signin'); // Redirect after success
    } catch (error: unknown) {
      console.error("Reset password error:", error);
      let errorMessage = "Failed to reset password";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <ComponentCard title="Reset password">
        <div className="text-center py-8 text-gray-500">Loading user data...</div>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Reset password">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="col-span-full">
            <Label>Email</Label>
            <Input
              type="email"
              value={user.email}
              disabled
              readOnly
            />
          </div>
          
          <div className="col-span-full">
            <Label>Old Password</Label>
            <div className="relative">
              <Input
                name="oldPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your old password"
                value={formData.oldPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <div className="col-span-full">
            <Label>New Password</Label>
            <div className="relative">
              <Input
                name="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <div className="col-span-full">
            <Label>Confirm Password</Label>
            <div className="relative">
              <Input
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          <div className="col-span-full">
            <Button 
              className="w-full" 
              size="sm"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Submit"}
            </Button>
          </div>
        </div>
      </form>
    </ComponentCard>
  );
}