import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import Loading from '../components/Loading';
import ErrorMsg from '../components/ErrorMsg';
import Modal from '../components/Modal';
import { Plus, Image as ImageIcon, CheckCircle, XCircle, Trash2 } from 'lucide-react';

const TemplateCard = ({ template, onDelete, onUse }) => {
  const serverUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:3000';
  const imageUrl = template.file_path ? `${serverUrl}/${template.file_path}` : null;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
      <div style={{ height: '140px', background: 'var(--bg-element)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={template.name} 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div style={{ display: imageUrl ? 'none' : 'flex' }}>
          <ImageIcon size={48} color="var(--text-muted)" />
        </div>
      </div>
      <div style={{ padding: '20px' }}>
        <div className="flex-between mb-4">
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{template.name}</h3>
          {template.is_active ? 
            <CheckCircle size={18} color="var(--success)" title="Active" /> : 
            <XCircle size={18} color="var(--danger)" title="Inactive" />
          }
        </div>
        <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
          <strong>Occasion:</strong> {template.occasion}
        </p>
        <p className="muted" style={{ fontSize: '0.8rem', marginBottom: '16px' }}>
          File: {template.file_name}
        </p>
        <div className="flex-between">
          <Button variant="secondary" onClick={() => onUse(template)} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Use Template</Button>
          <button 
            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
            onClick={() => onDelete(template.id)}
            title="Delete Template"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Templates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ name: '', occasion: '', file: null });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get('/templates');
      setTemplates(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.name || !uploadData.occasion || !uploadData.file) {
      setUploadError('Please fill in all fields and select a file.');
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadError(null);
      
      const formData = new FormData();
      formData.append('name', uploadData.name);
      formData.append('occasion', uploadData.occasion);
      formData.append('file', uploadData.file);
      formData.append('is_active', 'true');

      await api.post('/templates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setIsModalOpen(false);
      setUploadData({ name: '', occasion: '', file: null });
      fetchTemplates();
    } catch (err) {
      setUploadError(err.message || 'Failed to upload template');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      await api.delete(`/templates/${id}`);
      fetchTemplates();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h1>Templates</h1>
          <p>Manage your reusable SVG templates.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}><Plus size={18} /> New Template</Button>
      </div>

      {isLoading && <Loading message="Loading templates..." />}
      <ErrorMsg message={error} />

      {!isLoading && !error && templates.length === 0 && (
        <div className="card mt-4" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <ImageIcon size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h2>No templates found</h2>
          <p className="muted mb-4">You haven't uploaded any SVG templates yet.</p>
          <Button onClick={() => setIsModalOpen(true)}>Upload your first template</Button>
        </div>
      )}

      {!isLoading && !error && templates.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', marginTop: '24px' }}>
          {templates.map(tpl => (
            <TemplateCard 
              key={tpl.id} 
              template={tpl} 
              onDelete={handleDelete} 
              onUse={(template) => navigate('/preview', { state: { templateId: template.id } })} 
            />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload New Template">
        <form onSubmit={handleUploadSubmit}>
          <ErrorMsg message={uploadError} />
          <div className="form-group">
            <label className="form-label">Template Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Birthday Balloons"
              value={uploadData.name}
              onChange={e => setUploadData({...uploadData, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Occasion</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Birthday"
              value={uploadData.occasion}
              onChange={e => setUploadData({...uploadData, occasion: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">SVG File</label>
            <input 
              type="file" 
              accept=".svg"
              className="form-input" 
              style={{ padding: '8px' }}
              onChange={e => setUploadData({...uploadData, file: e.target.files[0]})}
            />
          </div>
          <div className="flex-between mt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isUploading}>Upload Template</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Templates;
