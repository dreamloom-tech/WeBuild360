"use client";
import { useEffect, useState } from 'react';
import styles from '../profile/profile.module.css';
import { fetchWithAuth } from '@/lib/fetchWithAuth';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  const uploadAvatar = async (file: File) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await fetchWithAuth('/api/auth/upload-avatar', { 
        method: 'POST',
        body: formData 
      });
      if (!res.ok) {
        throw new Error('Upload failed');
      }
      const data = await res.json();
      await fetchWithAuth('/api/auth/update', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ avatar: data.url }) 
      });
      setUser((u:any) => ({...u, avatar: data.url}));
      setMessage('Profile picture updated successfully');
    } catch (error) {
      setMessage('Failed to upload image');
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
        throw new Error('Update failed');
      }
      setUser((u:any) => ({...u, ...form}));
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
            src={user?.avatar || '/images/layout_img/profile.png'} 
            alt="Profile" 
            className={styles.avatar} 
          />
          <label className={styles.avatarUpload}>
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])}
            />
            <span>📷</span>
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
