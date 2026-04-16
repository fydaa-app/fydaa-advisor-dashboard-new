'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ResetPasswordFormProps {
  isValidToken?: boolean;
  email?: string;
  token?: string;
}

export default function ResetPasswordForm({ 
}: ResetPasswordFormProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace('/forgotpassword');
  }, [router]);

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Redirecting...
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please use the <a href="/forgotpassword" className="text-blue-600 hover:text-blue-500">forgot password</a> page for OTP-based reset.
          </p>
        </div>
      </div>
    </div>
  );
}