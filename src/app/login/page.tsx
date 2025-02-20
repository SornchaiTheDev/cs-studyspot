import GoogleLoginButton from "@/components/auth/GoogleLoginButton";

export default function LoginPage() {
  return (
    <div className="h-screen flex flex-col justify-center items-center px-4">
      <h1 className="text-2xl font-bold text-center mb-8">Welcome to CS StudySpot</h1>
      <GoogleLoginButton />
    </div>
  );
} 