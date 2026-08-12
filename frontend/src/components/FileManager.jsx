import React, { useState, useEffect, useRef } from 'react';
import { uploadFileApi, fetchFilesApi, downloadFileApi, deleteFileApi } from '../api';

function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatDate(isoStr) {
  if (!isoStr) return '—';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return isoStr;
  }
}

function getFileIcon(contentType, originalName) {
  const ext = originalName ? originalName.split('.').pop().toLowerCase() : '';
  if (['pdf'].includes(ext) || contentType?.includes('pdf')) {
    return '📄';
  }
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext) || contentType?.includes('image')) {
    return '🖼️';
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) || contentType?.includes('zip')) {
    return '📦';
  }
  if (['doc', 'docx', 'txt', 'md'].includes(ext) || contentType?.includes('text')) {
    return '📝';
  }
  if (['py', 'js', 'html', 'css', 'json', 'cpp', 'java'].includes(ext)) {
    return '💻';
  }
  return '📁';
}

export default function FileManager({ userEmail = '' }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [description, setDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await fetchFilesApi();
      setFiles(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleUpload = async (fileObj) => {
    if (!fileObj) return;
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      await uploadFileApi(fileObj, description);
      setSuccess(`File "${fileObj.name}" uploaded successfully!`);
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadFiles();
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      await downloadFileApi(fileId, fileName);
    } catch (err) {
      alert(`Download failed: ${err.message}`);
    }
  };

  const handleDelete = async (fileId, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) return;
    try {
      await deleteFileApi(fileId);
      setSuccess(`Deleted "${fileName}"`);
      await loadFiles();
    } catch (err) {
      setError(`Delete failed: ${err.message}`);
    }
  };

  const filteredFiles = files.filter(f =>
    f.original_name.toLowerCase().includes(search.toLowerCase()) ||
    (f.description && f.description.toLowerCase().includes(search.toLowerCase())) ||
    (f.uploader_email && f.uploader_email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-main, #1e293b)', margin: 0 }}>
            File Hub & Learning Materials
          </h2>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '14px', marginTop: '4px' }}>
            Upload, download, and share course documents, assignments, and study materials.
          </p>
        </div>
        <button
          onClick={loadFiles}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Notification Alerts */}
      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fef2f2',
          borderLeft: '4px solid #ef4444',
          color: '#991b1b',
          borderRadius: '6px',
          marginBottom: '20px',
          fontSize: '14px',
        }}>
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#f0fdf4',
          borderLeft: '4px solid #22c55e',
          color: '#166534',
          borderRadius: '6px',
          marginBottom: '20px',
          fontSize: '14px',
        }}>
          ✅ {success}
        </div>
      )}

      {/* Upload Box */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          border: dragActive ? '2px dashed #3b82f6' : '2px dashed #cbd5e1',
          borderRadius: '12px',
          padding: '32px 24px',
          textAlign: 'center',
          backgroundColor: dragActive ? '#eff6ff' : '#f8fafc',
          transition: 'all 0.2s ease',
          marginBottom: '32px',
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>☁️</div>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
          Drag & Drop your files here, or <label htmlFor="file-upload-input" style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}>browse</label>
        </h3>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
          Supports PDFs, documents, images, code files, and archives.
        </p>

        <input
          id="file-upload-input"
          ref={fileInputRef}
          type="file"
          onChange={onFileSelect}
          style={{ display: 'none' }}
        />

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', maxWidth: '500px', margin: '0 auto' }}>
          <input
            type="text"
            placeholder="Add an optional description/notes..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              padding: '8px 20px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: uploading ? 0.7 : 1,
            }}
          >
            {uploading ? 'Uploading...' : 'Choose File'}
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 }}>
          All Shared Files ({filteredFiles.length})
        </h3>
        <input
          type="text"
          placeholder="Search by name, description, or uploader..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '8px 14px',
            width: '300px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '14px',
          }}
        />
      </div>

      {/* File List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Loading files...
        </div>
      ) : filteredFiles.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          color: '#64748b',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
          <p style={{ margin: 0, fontWeight: '500' }}>No files found.</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Upload a file above to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredFiles.map((file) => {
            const icon = getFileIcon(file.content_type, file.original_name);
            return (
              <div
                key={file.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '28px', flexShrink: 0 }}>{icon}</div>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '15px' }}>
                        {file.original_name}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        fontWeight: '500',
                      }}>
                        {formatBytes(file.size)}
                      </span>
                    </div>
                    {file.description && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#475569' }}>
                        {file.description}
                      </p>
                    )}
                    <div style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                      Uploaded by <strong style={{ color: '#64748b' }}>{file.uploader_email}</strong> on {formatDate(file.created_at)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '16px' }}>
                  <button
                    onClick={() => handleDownload(file.id, file.original_name)}
                    style={{
                      padding: '8px 14px',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    ⬇️ Download
                  </button>
                  <button
                    onClick={() => handleDelete(file.id, file.original_name)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#f87171',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                    title="Delete File"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
