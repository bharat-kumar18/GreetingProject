import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import ErrorMsg from '../components/ErrorMsg';
import Loading from '../components/Loading';
import { Play, Download, Image as ImageIcon } from 'lucide-react';

const Preview = () => {
  const location = useLocation();
  const initialTemplateId = location.state?.templateId || '';

  const [templates, setTemplates] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplateId);
  const [selectedRecipient, setSelectedRecipient] = useState('');
  
  const [previewImage, setPreviewImage] = useState(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsDataLoading(true);
        const [tplRes, recRes] = await Promise.all([
          api.get('/templates'),
          api.get('/recipients')
        ]);
        setTemplates(tplRes.data || []);
        setRecipients(recRes.data || []);
      } catch (err) {
        setError('Failed to load templates or recipients.');
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePreview = async () => {
    if (!selectedTemplate || !selectedRecipient) {
      setError('Please select both a template and a recipient.');
      return;
    }
    
    try {
      setIsPreviewing(true);
      setError(null);
      setSuccessMsg(null);
      setPreviewImage(null);
      
      const res = await api.post('/generation/preview', {
        templateId: selectedTemplate,
        recipientId: selectedRecipient
      });
      
      setPreviewImage(res.data.previewUrl);
    } catch (err) {
      setError(err.message || 'Failed to generate preview');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedTemplate || !selectedRecipient) {
      setError('Please select both a template and a recipient.');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setSuccessMsg(null);
      
      const res = await api.post('/generation/generate', {
        templateId: selectedTemplate,
        recipientId: selectedRecipient
      });
      
      setSuccessMsg(`Image generated and saved successfully! File: ${res.data.file_name}`);
    } catch (err) {
      setError(err.message || 'Failed to generate final image');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1>Single Preview & Generation</h1>
        <p>Select a template and a recipient to dynamically generate a personalized image.</p>
      </div>

      {isDataLoading ? (
        <Loading message="Loading configuration data..." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '32px' }}>
          
          {/* Configuration Sidebar */}
          <div className="card" style={{ alignSelf: 'start' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Configuration</h2>
            <ErrorMsg message={error} />
            
            {successMsg && (
              <div className="error-container mt-4 mb-4" style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'rgba(34, 197, 94, 0.2)', color: '#86efac' }}>
                <span>{successMsg}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Select Template</label>
              <select 
                className="form-input" 
                value={selectedTemplate} 
                onChange={(e) => { setSelectedTemplate(e.target.value); setPreviewImage(null); }}
              >
                <option value="">-- Choose a Template --</option>
                {templates.map(tpl => (
                  <option key={tpl.id} value={tpl.id}>{tpl.name} ({tpl.occasion})</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label className="form-label">Select Recipient</label>
              <select 
                className="form-input" 
                value={selectedRecipient} 
                onChange={(e) => { setSelectedRecipient(e.target.value); setPreviewImage(null); }}
              >
                <option value="">-- Choose a Recipient --</option>
                {recipients.map(rec => (
                  <option key={rec.id} value={rec.id}>{rec.name} - {rec.email}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Button 
                onClick={handlePreview} 
                isLoading={isPreviewing} 
                disabled={!selectedTemplate || !selectedRecipient || isGenerating}
                style={{ width: '100%' }}
              >
                <Play size={18} /> Run Live Preview
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={handleGenerate} 
                isLoading={isGenerating}
                disabled={!previewImage || isPreviewing}
                style={{ width: '100%', border: '1px solid var(--brand-primary)', color: 'var(--brand-primary)', background: 'transparent' }}
              >
                <Download size={18} /> Finalize & Generate PNG
              </Button>
            </div>
          </div>

          {/* Preview Canvas */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Canvas View</h2>
            <div style={{ 
              flex: 1, 
              background: 'var(--bg-base)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px dashed var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              padding: '24px'
            }}>
              {isPreviewing ? (
                <div style={{ textAlign: 'center' }}>
                  <Loading message="Rendering personalized graphic..." />
                </div>
              ) : previewImage ? (
                <img 
                  src={previewImage} 
                  alt="Personalized Preview" 
                  style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }} 
                />
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  <ImageIcon size={64} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                  <p>Select configurations and click "Run Live Preview" to generate a temporary image via the engine.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Preview;
