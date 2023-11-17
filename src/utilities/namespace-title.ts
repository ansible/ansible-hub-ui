export function namespaceTitle({
  name,
  company,
}: {
  name: string;
  company?: string;
}): string {
  return IS_INSIGHTS ? company || name : name;
}
