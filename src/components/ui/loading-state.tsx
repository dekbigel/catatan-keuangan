import { LoaderCircle } from "lucide-react";

type LoadingStateProps = {
  title?: string;
  description?: string;
};

export function LoadingState({
  title = "Memuat data",
  description = "Tunggu sebentar, kami sedang menyiapkan tampilan Anda.",
}: LoadingStateProps) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-8 text-center">
      <LoaderCircle className="mx-auto size-6 animate-spin text-emerald-600" />
      <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-950">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
