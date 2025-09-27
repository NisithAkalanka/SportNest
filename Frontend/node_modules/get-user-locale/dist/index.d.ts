export declare const getUserLocales: (options?: {
    useFallbackLocale?: boolean;
    fallbackLocale?: string;
} | undefined) => string[];
export declare const getUserLocale: {
    (options?: undefined): string;
    (options?: Record<string, never>): string;
    (options?: {
        useFallbackLocale: false;
        fallbackLocale?: string;
    }): string | null;
    (options?: {
        useFallbackLocale?: true;
        fallbackLocale?: string;
    }): string;
};
export default getUserLocale;
