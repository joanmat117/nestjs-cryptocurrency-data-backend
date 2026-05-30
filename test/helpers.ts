/** Build a Neon connection URL scoped to the test schema via search_path. */
export function buildTestSchemaUrl(directUrl: string): string {
  const separator = directUrl.includes('?') ? '&' : '?';
  return `${directUrl}${separator}options=-c%20search_path=test`;
}
