import { useAuth, useClerk } from "@/lib/auth-context";

export function useApiClient() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const rawBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:5000/api" : "");
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");

  const fetcher = async (path: string, options: RequestInit = {}) => {
    try {
      if (!baseUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured. Set it to your deployed backend API URL and redeploy the frontend."
        );
      }
      if (!isLoaded) {
        throw new Error("Authentication is still loading. Please try again.");
      }
      if (!isSignedIn) {
        throw new Error("You must be signed in to access this resource.");
      }

      const token = await getToken();
      if (!token) {
        throw new Error("Missing session token. Please sign in again.");
      }

      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      };

      const res = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers,
      });

      if (!res.ok) {
        if (res.status === 401) {
          console.warn("[API Client] 401 Unauthorized received. Clearing session and redirecting to /auth.");
          await signOut({ redirectUrl: "/auth" });
          throw new Error("Session expired. Please sign in again.");
        }
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      return await res.json();
    } catch (error) {
      console.error(`API fetcher error for path: ${path}`, error);
      throw error;
    }
  };

  return fetcher;
}

/** True when Clerk has loaded and the user has an active session. */
export function useIsApiReady() {
  const { isLoaded, isSignedIn } = useAuth();
  return isLoaded && isSignedIn;
}

export default useApiClient;
