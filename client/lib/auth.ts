export type Role = "user" | "admin" | "gov";
const KEY = "natpac_auth_role";

export function getRole(): Role | null {
  const v = localStorage.getItem(KEY) as Role | null;
  return v ?? null;
}
export function isAuthed() {
  return getRole() !== null;
}
export function loginWithCredentials(
  username: string,
  password: string,
): Role | null {
  const table: Record<string, { pass: string; role: Role }> = {
    user: { pass: "123", role: "user" },
    admin: { pass: "123", role: "admin" },
    gov: { pass: "123", role: "gov" },
  };
  const rec = table[username];
  if (rec && rec.pass === password) {
    localStorage.setItem(KEY, rec.role);
    return rec.role;
  }
  return null;
}
export function logout() {
  localStorage.removeItem(KEY);
}
export function hasAnyRole(roles: Role[]) {
  const r = getRole();
  return r ? roles.includes(r) : false;
}
