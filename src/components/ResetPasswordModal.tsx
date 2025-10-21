"use client";
import { useState } from 'react';
import fetchWithAuth from '@/lib/fetchWithAuth';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

type Props = { open: boolean; onClose: () => void };

export default function ResetPasswordModal({ open, onClose }: Props) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/auth/change-password', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      onClose();
    } catch (e: any) {
      setError(e.message || 'Error');
    } finally { 
      setLoading(false); 
    }
  };

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
      <div style={{ background: '#fff', padding: 20, borderRadius: 8, width: 420 }}>
        <h3 style={{ margin: 0 }}>Reset Password</h3>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginTop: 12, position: 'relative' }}>
            <label htmlFor="currentPassword" style={{ display: 'block' }}>Current password</label>
            <input
              id="currentPassword"
              type={showOld ? 'text' : 'password'}
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              style={{ width: '100%', padding: 10, marginTop: 6 }}
              required
            />
            <button 
              type="button"
              onClick={() => setShowOld(v => !v)}
              style={{ position: 'absolute', right: 14, top: 44, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {showOld ? <FaEyeSlash/> : <FaEye/>}
            </button>
          </div>
          <div style={{ marginTop: 12, position: 'relative' }}>
            <label htmlFor="newPassword" style={{ display: 'block' }}>New password</label>
            <input
              id="newPassword"
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: 10, marginTop: 6 }}
              required
            />
            <button 
              type="button"
              onClick={() => setShowNew(v => !v)}
              style={{ position: 'absolute', right: 14, top: 44, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {showNew ? <FaEyeSlash/> : <FaEye/>}
            </button>
          </div>
          <div style={{ marginTop: 12, position: 'relative' }}>
            <label htmlFor="confirmPassword" style={{ display: 'block' }}>Confirm password</label>
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              style={{ width: '100%', padding: 10, marginTop: 6 }}
              required
            />
            <button 
              type="button"
              onClick={() => setShowConfirm(v => !v)}
              style={{ position: 'absolute', right: 14, top: 44, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {showConfirm ? <FaEyeSlash/> : <FaEye/>}
            </button>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} disabled={loading} style={{ padding: '8px 12px' }}>
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              style={{ 
                padding: '8px 12px',
                backgroundColor: '#6d28d9',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              {loading ? 'Saving...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
