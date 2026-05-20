import { AuthForm } from "@/components/auth/AuthForm";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function AuthPage() {
  return (
    <AuthLayout>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Unlock your potential
        </h1>
        <p className="text-sm text-slate-500">
          Enter your email below to access the platform.
        </p>
      </div>
      <AuthForm />
    </AuthLayout>
  );
}