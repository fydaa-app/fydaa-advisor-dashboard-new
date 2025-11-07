// app/reset-password/page.tsx
import ResetPasswordForm from "@/components/auth/ResetPassword";
import { Metadata } from "next";
import { validateResetToken } from "@/services";

export const metadata: Metadata = {
  title: "Reset Password | Fydaa",
  description: "Reset Password",
};

export default async function ResetPasswordPage({
  searchParams,
}: { 
  searchParams: Promise<{ token?: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const token = Array.isArray(resolvedSearchParams.token) 
    ? resolvedSearchParams.token[0] 
    : resolvedSearchParams.token;
  let isValidToken = false;
  let email: string | undefined = undefined;

  if (token) {
    const validationResult = await validateResetToken(token);
    isValidToken = validationResult.isValid;
    email = validationResult.email || undefined;
  }

  return (
    <ResetPasswordForm 
      isValidToken={isValidToken} 
      email={email}
      token={token}
    />
  );
}
