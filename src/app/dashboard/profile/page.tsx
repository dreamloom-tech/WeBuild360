"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../profile/profile.module.css';

function avatarUrlWithCache(url?: string | null, ts?: string | null) {
  if (!url) return '/file.svg';
  return ts ? `${url}?t=${ts}` : url;
}
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const router = useRouter();
  const [avatarSrc, setAvatarSrc] = useState<string>('/file.svg');

  useEffect(() => {
    async function load() {
      const res = await fetchWithAuth('/api/auth/me');
      if (!res.ok) return;
      const data = await res.json();
      setUser(data.user);
      setForm({ 
        name: data.user.name, 
        email: data.user.email, 
        mobile: data.user.mobile || '', 
        address: data.user.address || '' 
      });
    }
    load();
  }, []);

  // set avatarSrc after mount to avoid SSR/client mismatch
  useEffect(() => {
    try {
      const ts = typeof window !== 'undefined' ? localStorage.getItem('avatar_ts') : '';
  setAvatarSrc(avatarUrlWithCache(user?.avatar || '/file.svg', ts || null));
    } catch (e) {
  setAvatarSrc(user?.avatar || '/file.svg');
    }
  }, [user]);

  const uploadAvatar = async (file: File) => {
    try {
      setLoading(true);
      setMessage(''); // Clear any previous messages

      // Create form data
      const formData = new FormData();
      formData.append('avatar', file, file.name); // Add filename explicitly

      // Upload the image
      const uploadRes = await fetch('/api/auth/upload-avatar', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });

      // Safely parse response: prefer JSON, fallback to text
      const contentType = uploadRes.headers.get('content-type') || '';
      let data: any = null;
      if (contentType.includes('application/json')) {
        data = await uploadRes.json();
      } else {
        const text = await uploadRes.text();
        // If server returned HTML (starts with '<'), surface a friendly error
        if (text.trim().startsWith('<')) {
          console.error('Server returned HTML error page for avatar upload:', text.slice(0, 500));
          throw new Error('Upload failed: server returned an HTML error page. Check server logs.');
        }
        try {
          data = text ? JSON.parse(text) : null;
        } catch (e) {
          // Not JSON — return text as error
          throw new Error(text || 'Upload failed with non-JSON response');
        }
      }

      if (!uploadRes.ok) {
        const bodyPreview = typeof data === 'string' ? data.slice(0, 500) : JSON.stringify(data).slice(0, 500);
        throw new Error(`Upload failed (status ${uploadRes.status}): ${bodyPreview}`);
      }

      const { url, user: uploadUser } = data;

      // If upload endpoint already persisted the user and returned it, use that
      if (uploadUser) {
        setUser(uploadUser);
        try { localStorage.setItem('user', JSON.stringify(uploadUser)); } catch (e) {}
        // bump avatar timestamp to bust caches
        try { localStorage.setItem('avatar_ts', String(Date.now())); } catch (e) {}
        try { router.refresh(); } catch (e) {}
      } else {
        // Otherwise call update endpoint to persist avatar
        const updateRes = await fetchWithAuth('/api/auth/update', { 
          method: 'PUT', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ avatar: url }) 
        });

        if (!updateRes.ok) {
          const err = await updateRes.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to update profile');
        }

        const updated = await updateRes.json();
        if (updated && updated.user) {
          setUser(updated.user);
          try { localStorage.setItem('user', JSON.stringify(updated.user)); } catch (e) {}
          try { router.refresh(); } catch (e) {}
        }
      }
      setMessage('Profile picture updated successfully');
    } catch (error: any) {
      setMessage(error.message || 'Failed to upload image');
      console.error('Avatar upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/auth/update', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(form) 
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Update failed');
      }
      const updated = await res.json();
      if (updated && updated.user) {
        setUser(updated.user);
        try { localStorage.setItem('user', JSON.stringify(updated.user)); } catch (e) {}
        try { localStorage.setItem('avatar_ts', String(Date.now())); } catch (e) {}
        try { router.refresh(); } catch (e) {}
      }
      setEditing(false);
      setMessage('Profile updated successfully');
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <div className={styles.avatarSection}>
          <img 
            src={avatarSrc} 
            alt="Profile" 
            className={styles.avatar}
              onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = '/file.svg';
            }}
          />
          <label className={styles.avatarUpload} title="Upload profile picture">
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Validate file size (max 5MB)
                  if (file.size > 5 * 1024 * 1024) {
                    setMessage('Image size should be less than 5MB');
                    return;
                  }
                  // Validate file type
                  if (!file.type.startsWith('image/')) {
                    setMessage('Please select an image file');
                    return;
                  }
                  uploadAvatar(file);
                }
              }}
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </label>
        </div>

        <div>
          <h3 className={styles.userName}>{user?.name || 'User'}</h3>
          <p className={styles.userEmail}>{user?.email}</p>
          <p className={styles.username}>@{user?.username}</p>
        </div>
      </div>

      <div className={styles.profileForm}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Name</label>
          <input
            type="text"
            className={styles.input}
            value={form.name || ''}
            onChange={(e) => setForm({...form, name: e.target.value})}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            className={styles.input}
            value={form.email || ''}
            disabled
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Mobile</label>
          <input
            type="tel"
            className={styles.input}
            value={form.mobile || ''}
            onChange={(e) => setForm({...form, mobile: e.target.value})}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Address</label>
          <input
            type="text"
            className={styles.input}
            value={form.address || ''}
            onChange={(e) => setForm({...form, address: e.target.value})}
          />
        </div>

        {message && (
          <p className={message.includes('Failed') ? styles.errorText : styles.successText}>
            {message}
          </p>
        )}
        
        <button 
          className={styles.saveButton}
          onClick={save}
          disabled={loading || !form.name}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
