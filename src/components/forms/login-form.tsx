"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

import { loginAction } from "@/app/(auth)/actions";
import { AuthSubmitButton } from "@/components/forms/auth-submit-button";
import { FormMessage } from "@/components/forms/form-message";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/validations/auth";
import type { LoginFormValues } from "@/types/auth";

type LoginFormProps = {
  callbackError?: boolean;
};

export function LoginForm({ callbackError = false }: LoginFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverMessage, setServerMessage] = useState<string | null>(
    callbackError
      ? "Tautan verifikasi tidak valid atau sudah kedaluwarsa. Silakan login ulang."
      : null,
  );

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setServerMessage(null);
    setPending(true);

    startTransition(async () => {
      const result = await loginAction(values);

      if (result?.status === "error") {
        setServerMessage(result.message);
        setPending(false);
        return;
      }

      router.refresh();
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
      noValidate
    >
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground">
          Selamat datang kembali
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Masuk untuk melanjutkan pengelolaan keuangan pribadi Anda.
        </p>
      </div>

      <div className="space-y-4">
        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="email" className="text-xs font-semibold">
            Email
          </FieldLabel>
          <FieldContent className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="nama@email.com"
              aria-invalid={!!form.formState.errors.email}
              {...form.register("email")}
              className="h-11 rounded-xl border-border bg-background pl-10 text-sm shadow-soft transition-colors focus:border-primary"
            />
            {form.formState.errors.email && (
              <FieldError errors={[form.formState.errors.email]} />
            )}
          </FieldContent>
        </Field>

        <Field data-invalid={!!form.formState.errors.password}>
          <FieldLabel htmlFor="password" className="text-xs font-semibold">
            Password
          </FieldLabel>
          <FieldContent className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Masukkan password"
              aria-invalid={!!form.formState.errors.password}
              {...form.register("password")}
              className="h-11 rounded-xl border-border bg-background pl-10 pr-11 text-sm shadow-soft transition-colors focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
            {form.formState.errors.password && (
              <FieldError errors={[form.formState.errors.password]} />
            )}
          </FieldContent>
        </Field>
      </div>

      {serverMessage ? (
        <FormMessage tone="error" message={serverMessage} />
      ) : null}

      <AuthSubmitButton
        label="Masuk ke Dashboard"
        loadingLabel="Sedang masuk..."
        pending={pending}
      />
    </form>
  );
}
