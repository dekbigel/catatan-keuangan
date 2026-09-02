import { LoginForm } from "@/components/forms/login-form";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackError = params?.error === "callback_failed";

  return <LoginForm callbackError={callbackError} />;
}
