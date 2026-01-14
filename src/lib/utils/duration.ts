export function formatDuration(start: Date, end: Date | null): string {
  if (!end) return 'Ongoing';
  const diff = end.getTime() - start.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
}
