export const searchText = (value: string) =>
  value
    .trim()
    .replace(/[^\p{L}\p{N}@ ._+-]/gu, "")
    .replace(/[%_*]/g, "")
    .slice(0, 100);
