export type Staff = {
  firstName: string;
  lastName: string;
  wageType: string;
  paymentOn: string;
  salary: string | number;
  workerType: string;
  mode: string;
  account: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  advance?: number;
};

export type SalaryRecord = {
  name: string;
  type: string;
  salary: number;
  paid: number;
  pending: number;
  status: string;
  date?: string;
};

const STAFF_KEY = 'webuild:staff';
const SALARY_KEY = 'webuild:salary_history';

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getStaff(): Staff[] {
  if (typeof window === 'undefined') return [];
  return safeParse<Staff[]>(localStorage.getItem(STAFF_KEY), []);
}

export function saveStaff(list: Staff[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STAFF_KEY, JSON.stringify(list));
}

export function getSalaryHistory(): SalaryRecord[] {
  if (typeof window === 'undefined') return [];
  return safeParse<SalaryRecord[]>(localStorage.getItem(SALARY_KEY), []);
}

export function saveSalaryHistory(rows: SalaryRecord[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SALARY_KEY, JSON.stringify(rows));
}

export function clearAll() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STAFF_KEY);
  localStorage.removeItem(SALARY_KEY);
}

export default { getStaff, saveStaff, getSalaryHistory, saveSalaryHistory, clearAll };
