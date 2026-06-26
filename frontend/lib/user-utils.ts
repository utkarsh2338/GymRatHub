export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";
}

export function getPlanLabel(plan?: string) {
  if (plan === "elite") return "Elite Member";
  if (plan === "free") return "Free Member";
  return "Pro Member";
}
