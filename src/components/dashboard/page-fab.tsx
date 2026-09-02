import type { ReactNode } from "react";

/**
 * Wrapper untuk tombol aksi utama (FAB) di setiap halaman.
 * - Mobile: melayang di atas bottom navigation (tidak menutupi konten).
 * - Desktop: melayang di pojok kanan bawah.
 */
export function PageFab({ children }: { children: ReactNode }) {
  return (
    <div className="fixed bottom-24 right-4 z-50 flex items-center gap-2 sm:bottom-24 lg:bottom-8 lg:right-8">
      {children}
    </div>
  );
}
