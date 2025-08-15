// Dark mode functionality removed - providing stub exports for compatibility

export type Appearance = 'light';

export function initializeTheme() {
    // No-op: dark mode removed, always light mode
}

export function useAppearance() {
    return { 
        appearance: 'light' as const, 
        updateAppearance: () => {} 
    } as const;
}
