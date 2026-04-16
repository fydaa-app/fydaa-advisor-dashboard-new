"use client";
import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { forgotPassword, resetPasswordWithToken } from '@/services';

const SendOtpStep = ({ onOtpSent }: { onOtpSent: (email: string) => void }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await forgotPassword(email);

      if (result.success) {
        setMessage({ text: result.message || 'OTP sent successfully', type: 'success' });
        setTimeout(() => onOtpSent(email), 1500);
      } else {
        setMessage({ 
          text: result.message || 'Something went wrong', 
          type: 'error' 
        });
      }
    } catch (err) {
      setMessage({ 
        text: 'Failed to connect to server', 
        type: 'error' 
      });
      console.error('Forgot password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {message && (
        <div
          className={`mb-4 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Sending OTP...' : 'Send OTP'}
        </button>
      </div>

      <div className="mt-6 text-center">            
        <Link href="/signin" className="text-sm text-blue-600 hover:text-blue-500">
          Remember your password? Sign in
        </Link>
      </div>
    </form>
  );
};

const ResetPasswordStep = ({ email }: { email: string }) => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      setIsLoading(false);
      return;
    }

    try {
      const result = await resetPasswordWithToken(email, otp, newPassword, confirmPassword);

      if (result.success) {
        setMessage({ text: result.message || 'Password reset successfully', type: 'success' });
        setTimeout(() => window.location.href = '/signin', 1500);
      } else {
        setMessage({ 
          text: result.message || 'Invalid or expired OTP', 
          type: 'error' 
        });
      }
    } catch (err) {
      setMessage({ 
        text: 'Failed to connect to server', 
        type: 'error' 
      });
      console.error('Reset password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {message && (
        <div
          className={`mb-4 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
          Enter OTP
        </label>
        <div className="mt-1">
          <input
            id="otp"
            name="otp"
            type="text"
            required
            maxLength={6}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
          New Password
        </label>
        <div className="mt-1">
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            minLength={8}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <div className="mt-1">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </div>
    </form>
  );
};

const ForgotPasswordPage = () => {
  const [step, setStep] = useState<'send-otp' | 'reset-password'>('send-otp');
  const [email, setEmail] = useState('');

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">    
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <Head>
          <title>Forgot Password</title>
        </Head>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 'send-otp' ? 'Forgot your password?' : 'Reset Password'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'send-otp' 
              ? 'Enter your email and we\'ll send you an OTP'
              : 'Enter the OTP sent to your email and create a new password'}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {step === 'send-otp' ? (
              <SendOtpStep onOtpSent={(e) => { setEmail(e); setStep('reset-password'); }} />
            ) : (
              <ResetPasswordStep email={email} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;