export async function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      throw new Error('No authentication token found');
    }

    const headers = new Headers(init?.headers || {});
    headers.set('Authorization', `Bearer ${token}`);
    
    if (init?.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const merged: RequestInit = { ...init, headers };
    const response = await fetch(input, merged);

    // Handle 401 Unauthorized responses
    if (response.status === 401) {
      localStorage.removeItem('token'); // Clear invalid token
      throw new Error('Authentication failed - please log in again');
    }

    return response;
  } catch (error: any) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export default fetchWithAuth;
