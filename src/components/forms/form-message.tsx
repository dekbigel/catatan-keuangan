import { cn } from "@/lib/utils";

type FormMessageProps = {
  tone: "success" | "error" | "info";
  message: string;
};

export function FormMessage({ tone, message }: FormMessageProps) {
  return (
    <div
      className={cn(
        "rounded-lg px-2 py-1 text-[11px]",
        tone === "success" && "border border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
        tone === "error" && "border border-rose-500/20 bg-rose-500/10 text-rose-700",
        tone === "info" && "border border-sky-500/20 bg-sky-500/10 text-sky-700",
      )}
    >
      {message}
    </div>
  );
}
