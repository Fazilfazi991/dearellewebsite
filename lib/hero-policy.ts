export function shouldAutoplayFilm(preferences: {
  reducedMotion: boolean;
  saveData?: boolean;
  effectiveType?: string;
}) {
  return (
    !preferences.reducedMotion &&
    !preferences.saveData &&
    !["slow-2g", "2g"].includes(preferences.effectiveType ?? "")
  );
}
