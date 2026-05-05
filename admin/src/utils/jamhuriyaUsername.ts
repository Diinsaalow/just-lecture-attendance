/** Jamhuriya lecturer login format stored lowercase (`j2601`); display as `J2601`. */
export function formatJamhuriyaUsername(username: string): string {
    const m = username.trim().match(/^j(\d{2})(\d+)$/i);
    if (!m) return username;
    return `J${m[1]}${m[2]}`;
}
