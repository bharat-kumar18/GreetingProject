import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import Button from '../components/Button';
import Loading from '../components/Loading';
import ErrorMsg from '../components/ErrorMsg';
import Modal from '../components/Modal';
import { Download, Eye, Search, Image as ImageIcon, CheckCircle, XCircle, Mail } from 'lucide-react';

const GeneratedOutputs = () => {
  const [outputs, setOutputs] = useState([]);
  const [templates, setTemplates] = useState({});
  const [recipients, setRecipients] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingOutputId, setSendingOutputId] = useState(null);
  const [emailFeedback, setEmailFeedback] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Preview Modal
  const [previewImage, setPreviewImage] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [outRes, tplRes, recRes] = await Promise.all([
          api.get('/generation/outputs'),
          api.get('/templates'),
          api.get('/recipients')
        ]);
        
        // Convert to maps for easy O(1) lookup
        const tplMap = {};
        if (tplRes.data) {
          tplRes.data.forEach(t => tplMap[t.id] = t);
        }
        setTemplates(tplMap);
        
        const recMap = {};
        if (recRes.data) {
          recRes.data.forEach(r => recMap[r.id] = r);
        }
        setRecipients(recMap);
        
        setOutputs(outRes.data || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch generated outputs');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const mergedOutputs = useMemo(() => {
    return outputs.map(out => {
      const template = templates[out.template_id] || {};
      const recipient = recipients[out.recipient_id] || {};
      return {
        ...out,
        templateName: template.name || 'Unknown Template',
        recipientName: recipient.name || 'Unknown',
        recipientEmail: recipient.email || 'Unknown',
        recipientOccasion: recipient.occasion || 'Unknown'
      };
    });
  }, [outputs, templates, recipients]);

  const filteredOutputs = useMemo(() => {
    return mergedOutputs.filter(o => 
      o.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.file_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mergedOutputs, searchTerm]);

  const handleDownload = (outputId, filename) => {
    // We trigger download by constructing the URL directly since our backend handles the stream.
    // Given the Axios interceptors, we can't cleanly pipe binary streams unless we define a dedicated util.
    // Standard approach: open window or create anchor.
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/generation/outputs/${outputId}/download`;
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (outputId) => {
    // For preview, we can just use the download URL as the src for an img tag
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/generation/outputs/${outputId}/download`;
    setPreviewImage(url);
    setIsPreviewModalOpen(true);
  };

  const handleSendEmail = async (output) => {
    if (!window.confirm(`Send this greeting email to ${output.recipientEmail}?`)) return;

    setSendingOutputId(output.id);
    setEmailFeedback(null);
    try {
      const response = await api.post('/email/send', { outputId: output.id });
      const updatedOutput = response.data;
      setOutputs(current => current.map(item => item.id === output.id ? updatedOutput : item));
      setEmailFeedback({
        type: 'success',
        message: response.message || 'Email request completed.'
      });
    } catch (err) {
      setEmailFeedback({ type: 'error', message: err.message || 'Failed to send email.' });
      try {
        const response = await api.get('/generation/outputs');
        setOutputs(response.data || []);
      } catch (refreshError) {
        console.error('Failed to refresh email status:', refreshError);
        setEmailFeedback(current => ({
          ...current,
          message: `${current.message} Could not refresh the delivery status.`
        }));
      }
    } finally {
      setSendingOutputId(null);
    }
  };

  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h1>Generated Images</h1>
          <p>View, preview, and download your successfully generated personalized images.</p>
        </div>
      </div>

      <div className="card mb-4" style={{ padding: '16px 24px' }}>
        <div className="flex-between">
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search outputs..." 
              style={{ paddingLeft: '38px', marginTop: 0 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="muted" style={{ fontSize: '0.9rem' }}>
            Total: {outputs.length} images
          </div>
        </div>
      </div>

      {isLoading && <Loading message="Loading generated outputs..." />}
      <ErrorMsg message={error} />
      <ErrorMsg message={emailFeedback?.type === 'error' ? emailFeedback.message : null} />
      {emailFeedback?.type === 'success' && (
        <div className="card mt-4" role="status" style={{ padding: '12px 16px', color: 'var(--success)' }}>
          {emailFeedback.message}
        </div>
      )}

      {!isLoading && !error && outputs.length === 0 && (
        <div className="card mt-4" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <ImageIcon size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h2>No generated images</h2>
          <p className="muted mb-4">You haven't generated any images yet. Use Single Preview or Batch Generation.</p>
        </div>
      )}

      {!isLoading && !error && outputs.length > 0 && (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Recipient</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Template</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Email Status</th>
                <th style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOutputs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No outputs match your search.
                  </td>
                </tr>
              ) : (
                filteredOutputs.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }} className="table-row-hover">
                    <td style={{ padding: '16px 24px' }}>
                      <strong>{o.recipientName}</strong><br/>
                      <span className="muted" style={{ fontSize: '0.85rem' }}>{o.recipientEmail} • {o.recipientOccasion}</span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--brand-primary)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 500 }}>
                        {o.templateName}
                      </span><br/>
                      <span className="muted" style={{ fontSize: '0.75rem', marginTop: '4px', display: 'inline-block' }}>{o.file_name}</span>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {o.email_status === 'sent' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)' }}><CheckCircle size={16} /> Sent</span>
                      ) : o.email_status === 'failed' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--danger)' }}><XCircle size={16} /> Failed</span>
                      ) : o.email_status === 'sending' ? (
                        <span className="muted">Sending...</span>
                      ) : o.email_status === 'simulated' ? (
                        <span className="muted">Simulated (not sent)</span>
                      ) : (
                        <span className="muted" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>Not Sent</span>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div className="flex-center" style={{ justifyContent: 'flex-end', gap: '8px' }}>
                        <Button variant="secondary" onClick={() => handlePreview(o.id, o.file_name)} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                          <Eye size={16} /> Preview
                        </Button>
                        <Button onClick={() => handleDownload(o.id, o.file_name)} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                          <Download size={16} /> Download
                        </Button>
                        <Button
                          variant="secondary"
                          isLoading={sendingOutputId === o.id}
                          disabled={Boolean(sendingOutputId) && sendingOutputId !== o.id}
                          onClick={() => handleSendEmail(o)}
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        >
                          <Mail size={16} /> {o.email_status === 'sent' ? 'Sent' : o.email_status === 'failed' ? 'Retry email' : 'Send email'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Image Preview Modal */}
      <Modal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} title="Image Preview">
        <div style={{ textAlign: 'center', background: 'var(--bg-base)', padding: '24px', borderRadius: 'var(--radius-md)' }}>
          {previewImage ? (
            <img 
              src={previewImage} 
              alt="Generated Result" 
              style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }} 
            />
          ) : (
            <Loading message="Loading preview..." />
          )}
          <div className="mt-4 text-right">
            <Button onClick={() => setIsPreviewModalOpen(false)}>Close Preview</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GeneratedOutputs;
