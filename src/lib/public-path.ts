export function publicPath(path: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  if (!base || path === base || path.startsWith(`${base}/`)) return path;
  return `${base}${path}`;
}
