// Utility to fetch all projects for dropdowns
import fetchWithAuth from './fetchWithAuth';

export interface ProjectDropdownItem {
  _id: string;
  name: string;
}

export async function fetchProjectDropdownItems(): Promise<ProjectDropdownItem[]> {
  const res = await fetchWithAuth('/api/projects');
  if (!res.ok) throw new Error('Failed to fetch projects');
  const json = await res.json();
  if (!Array.isArray(json)) return [];
  return json.map((p: any) => ({
    _id: p._id || p.id || '',
    name: p.name || p.projectName || '',
  })).filter(p => p._id && p.name);
}
