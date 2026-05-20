import { create } from 'zustand';

interface UserState {
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;

  requires2FA: boolean;
  is2FAVerified: boolean;
  setRequires2FA: (val: boolean) => void;
  set2FAVerified: (val: boolean) => void;

  role: 'CANDIDATE' | 'EMPLOYER' | null;
  setRole: (role: 'CANDIDATE' | 'EMPLOYER' | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  avatarUrl: null,
  setAvatarUrl: (url) => set({ avatarUrl: url }),

  requires2FA: false,
  is2FAVerified: false,
  setRequires2FA: (val) => set({ requires2FA: val }),
  set2FAVerified: (val) => set({ is2FAVerified: val }),

  role: null,
  setRole: (role) => set({ role }),
}));