import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
    selectedCompanyId: string | null;
    selectedCompanyName: string | null;
    hasSeenOnboarding: boolean;
    actions: {
        setSelectedCompany: (id: string, name: string) => void;
        clearSelectedCompany: () => void;
        markOnboardingSeen: () => void;
    };
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            selectedCompanyId: null,
            selectedCompanyName: null,
            hasSeenOnboarding: false,
            actions: {
                setSelectedCompany: (id, name) => set({ selectedCompanyId: id, selectedCompanyName: name }),
                clearSelectedCompany: () => set({ selectedCompanyId: null, selectedCompanyName: null }),
                markOnboardingSeen: () => set({ hasSeenOnboarding: true }),
            },
        }),
        {
            name: 'app-storage', // name of the item in the storage (must be unique)
            partialize: (state) => ({
                selectedCompanyId: state.selectedCompanyId,
                selectedCompanyName: state.selectedCompanyName,
                hasSeenOnboarding: state.hasSeenOnboarding,
            }),
        }
    )
);

export const useSelectedCompanyId = () => useAppStore((state) => state.selectedCompanyId);
export const useHasSeenOnboarding = () => useAppStore((state) => state.hasSeenOnboarding);
export const useAppActions = () => useAppStore((state) => state.actions);
