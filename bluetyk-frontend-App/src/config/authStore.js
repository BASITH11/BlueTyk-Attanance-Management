import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            authToken: null,
            isAuthenticated: true,

            login: (user, authToken) =>
                set(() => ({
                    user: user,
                    authToken: authToken,
                    isAuthenticated: true,
                })),

            logout: () =>
                set(() => ({
                    user: null,
                    authToken: null,
                    isAuthenticated: false,
                })),
        }),
        {
            name: "authStore",
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);
