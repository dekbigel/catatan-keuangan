"use client";

import { useState } from "react";
import {
    ChevronDown,
    LogOut,
    ReceiptText,
    Settings,
    User,
} from "lucide-react";

import { logoutAction } from "@/app/(dashboard)/actions";
import { SettingsForm } from "@/app/(dashboard)/settings/settings-form";
import { Button } from "@/components/ui/button";
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

type UserMenuProps = {
    userEmail?: string | null;
};

export function UserMenu({ userEmail }: UserMenuProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    return (
        <div className="space-y-1">

            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger
                    className="flex w-full items-center justify-between gap-1.5 rounded-md px-2 py-1.5 text-[11px] text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground h-8"
                >
                    <span className="flex items-center gap-1.5">
                        <User className="size-3.5" />
                        Akun
                    </span>
                    <ChevronDown
                        className={`size-3 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                    />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52">
                    <div className="px-2 py-1.5">
                        <p className="text-[11px] font-medium text-foreground">{userEmail ?? "Pengguna"}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => {
                            setMenuOpen(false);
                            setSettingsOpen(true);
                        }}
                    >
                        <span className="flex items-center gap-2 text-[11px] cursor-pointer">
                            <Settings className="size-3.5" />
                            Pengaturan
                        </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <form action={logoutAction} className="w-full">
                        <button
                            type="submit"
                            className="relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-[11px] text-destructive outline-none transition-colors hover:bg-destructive/5 focus:bg-destructive/5"
                        >
                            <LogOut className="size-3.5" />
                            Keluar
                        </button>
                    </form>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogContent className="w-[90vw] sm:max-w-3xl rounded-xl p-4">
                    <DialogHeader className="gap-1.5">
                        <DialogTitle className="text-sm">Pengaturan</DialogTitle>
                    </DialogHeader>
                    <SettingsForm onClose={() => setSettingsOpen(false)} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
