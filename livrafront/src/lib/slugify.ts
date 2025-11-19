export function slugToTitle(slug: string): string {
  if (!slug) return '';
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function titleToSlug(title: string): string {
  if (!title) return '';
  return title
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') 
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}