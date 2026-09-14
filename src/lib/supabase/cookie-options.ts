/** Session cookie lifetime — keeps users signed in across browser restarts */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 180; // 180 days

export const cookieOptions = {
  maxAge: SESSION_MAX_AGE_SECONDS,
  path: "/",
  sameSite: "lax" as const,
};
