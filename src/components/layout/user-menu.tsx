"use client";

import { useState } from "react";
import {
    ChevronDown,
    LogOut,
    Settings,
} from "lucide-react";

import { logoutAction } from "@/app/(dashboard)/actions";
import { SettingsForm } from "@/app/(dashboard)/settings/settings-form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type UserMenuProps = {
    userEmail?: string | null;
    variant?: "full" | "avatar";
};

function UserAvatar({ email, className }: { email?: string | null; className?: string }) {
    const initial = (email?.trim().charAt(0) || "P").toUpperCase();
    return (
        <div
            className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-sm font-bold text-primary-foreground shadow-soft",
                className
            )}
        >
            {initial}
        </div>
    );
}

export function UserMenu({ userEmail, variant = "full" }: UserMenuProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    return (
        <div>
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                {variant === "avatar" ? (
                    <DropdownMenuTrigger
                        aria-label="Menu akun"
                        className="cursor-pointer rounded-xl outline-none transition-transform hover:scale-[1.03] active:scale-95"
                    >
                        <UserAvatar email={userEmail} />
                    </DropdownMenuTrigger>
                ) : (
                    <DropdownMenuTrigger className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border border-border/60 bg-card px-2.5 py-2 text-left outline-none transition-colors hover:border-primary/30 hover:bg-muted/60">
                        <UserAvatar email={userEmail} className="size-8 rounded-lg text-xs" />
                        <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-semibold text-foreground">
                                {userEmail ?? "Pengguna"}
                            </span>
                            <span className="block text-[11px] text-muted-foreground">
                                Akun personal
                            </span>
                        </span>
                        <ChevronDown
                            className={cn(
                                "size-4 shrink-0 text-muted-foreground transition-transform",
                                menuOpen && "rotate-180"
                            )}
                        />
                    </DropdownMenuTrigger>
                )}
                <DropdownMenuContent
                    align={variant === "avatar" ? "end" : "start"}
                    side={variant === "avatar" ? "bottom" : "top"}
                    className="w-60 rounded-xl border-border/70 p-1.5 shadow-lift"
                >
                    <div className="flex items-center gap-2.5 px-2 py-2">
                        <UserAvatar email={userEmail} className="size-9" />
                        <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-foreground">
                                {userEmail ?? "Pengguna"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                Tersambung via Supabase
                            </p>
                        </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="rounded-lg"
                        onClick={() => {
                            setMenuOpen(false);
                            setSettingsOpen(true);
                        }}
                    >
                        <span className="flex items-center gap-2 text-xs cursor-pointer">
                            <Settings className="size-4" />
                            Pengaturan
                        </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <form action={logoutAction} className="w-full">
                        <button
                            type="submit"
                            className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-destructive outline-none transition-colors hover:bg-destructive/5 focus:bg-destructive/5"
                        >
                            <LogOut className="size-4" />
                            Keluar
                        </button>
                    </form>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogContent className="w-[92vw] sm:max-w-3xl rounded-2xl p-5">
                    <DialogHeader className="gap-1.5">
                        <DialogTitle className="text-base">Pengaturan</DialogTitle>
                    </DialogHeader>
                    <SettingsForm onClose={() => setSettingsOpen(false)} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
