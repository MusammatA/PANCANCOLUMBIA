'use client';

import { useState } from 'react';
import { IMAGE_BUCKET } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/client';

const MAX_BYTES = 5 * 1024 * 1024;

export function ImageField({ value, onChange, label = 'Photo' }: { value: string; onChange: (url: string) => void; label?: string }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function upload(file: File) {
    setError('');
    if (!file.type.startsWith('image/')) return setError('Please choose an image file.');
    if (file.size > MAX_BYTES) return setError('That photo is over 5 MB. Please choose a smaller one.');
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const path = `uploads/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;
      onChange(supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl);
    } catch {
      setError('The photo didn’t upload. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="image-field">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" />
        ) : (
          <div className="image-empty">No photo</div>
        )}
        <div className="image-actions">
          <label className="admin-button ghost">
            {uploading ? 'Uploading…' : value ? 'Change photo' : 'Upload photo'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              hidden
              disabled={uploading}
              onChange={event => {
                const file = event.target.files?.[0];
                if (file) upload(file);
                event.target.value = '';
              }}
            />
          </label>
          {value && (
            <button type="button" className="admin-button ghost" onClick={() => onChange('')}>Remove photo</button>
          )}
        </div>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}
