import type { SetActive } from "@clerk/shared/types";

/** Post-auth destination for sign-in and sign-up flows. */
export const AUTH_SUCCESS_PATH = "/dashboard";

/**
 * Activate a Clerk session then hard-navigate so middleware receives the cookie.
 */
export async function activateSessionAndNavigate(
  setActive: SetActive,
  sessionId: string | null | undefined,
  path: string = AUTH_SUCCESS_PATH
) {
  await setActive({
    session: sessionId,
    navigate: async ({ decorateUrl }) => {
      window.location.assign(decorateUrl(path));
    },
  });
}
