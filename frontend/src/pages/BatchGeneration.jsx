import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Button from '../components/Button';
import ErrorMsg from '../components/ErrorMsg';
import Loading from '../components/Loading';
import { Layers, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';

const BatchGeneration = () => {
  const [templates, setTemplates] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState(new Set());
  
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null); // The full job object
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);

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
        setError('Failed to load configuration data.');
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let interval;
    if (isPolling && jobId) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/generation/jobs/${jobId}`);
          const jobData = res.data;
          setJobStatus(jobData);
          
          if (jobData.status === 'completed' || jobData.status === 'failed') {
            setIsPolling(false);
            clearInterval(interval);
          }
        } catch (err) {
          setError(err.message || 'Failed to poll job status');
          setIsPolling(false);
          clearInterval(interval);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPolling, jobId]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = new Set(recipients.map(r => r.id));
      setSelectedRecipientIds(allIds);
    } else {
      setSelectedRecipientIds(new Set());
    }
  };

  const handleToggleRecipient = (id) => {
    const newSet = new Set(selectedRecipientIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedRecipientIds(newSet);
  };

  const handleStartBatch = async () => {
    if (!selectedTemplate || selectedRecipientIds.size === 0) {
      setError('Please select a template and at least one recipient.');
      return;
    }

    try {
      setError(null);
      setJobId(null);
      setJobStatus(null);
      
      const res = await api.post('/generation/batch', {
        templateId: selectedTemplate,
        recipientIds: Array.from(selectedRecipientIds)
      });
      
      setJobId(res.data.id);
      setJobStatus(res.data);
      setIsPolling(true);
    } catch (err) {
      setError(err.message || 'Failed to start batch job');
    }
  };

  const handleReset = () => {
    setJobId(null);
    setJobStatus(null);
    setIsPolling(false);
    setSelectedRecipientIds(new Set());
  };

  if (isDataLoading) {
    return (
      <div>
        <h1>Batch Generation</h1>
        <Loading message="Loading templates and recipients..." />
      </div>
    );
  }

  // Job active view
  if (jobId || jobStatus) {
    const total = jobStatus?.total_count || 0;
    const success = jobStatus?.success_count || 0;
    const failed = jobStatus?.failed_count || 0;
    const completed = success + failed;
    const progressPercent = total === 0 ? 0 : Math.round((completed / total) * 100);
    const isFinished = jobStatus?.status === 'completed' || jobStatus?.status === 'failed';

    return (
      <div>
        <div className="flex-between mb-4">
          <div>
            <h1>Batch Generation Progress</h1>
            <p className="muted">Job ID: {jobId}</p>
          </div>
          {isFinished && <Button onClick={handleReset} variant="secondary">Start New Batch</Button>}
        </div>

        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '24px', textTransform: 'capitalize' }}>Status: {jobStatus?.status || 'Processing...'}</h2>
          
          <div style={{ background: 'var(--bg-element)', borderRadius: 'var(--radius-full)', height: '12px', overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ 
              width: `${progressPercent}%`, 
              height: '100%', 
              background: 'var(--brand-primary)',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
          
          <p style={{ fontWeight: 600, fontSize: '1.2rem', marginBottom: '32px' }}>
            {progressPercent}% ({completed} / {total})
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--success)' }}>
              <CheckCircle size={32} style={{ margin: '0 auto 8px' }} />
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{success}</h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Successful</p>
            </div>
            
            <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--danger)' }}>
              <AlertTriangle size={32} style={{ margin: '0 auto 8px' }} />
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{failed}</h3>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Failed</p>
            </div>
          </div>
          
          {!isFinished && (
            <div className="mt-4 flex-center gap-4 text-muted">
              <RefreshCw size={16} className="spin" /> Processing images in the background...
            </div>
          )}
        </div>
      </div>
    );
  }

  // Configuration view
  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h1>Batch Generation</h1>
          <p>Generate personalized images for all selected recipients at once.</p>
        </div>
        <Button onClick={handleStartBatch} disabled={!selectedTemplate || selectedRecipientIds.size === 0}>
          <Layers size={18} /> Start Batch Job
        </Button>
      </div>

      <ErrorMsg message={error} />

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }}>
        <div className="card" style={{ alignSelf: 'start' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '24px' }}>Configuration</h2>
          <div className="form-group">
            <label className="form-label">Select Template</label>
            <select 
              className="form-input" 
              value={selectedTemplate} 
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              <option value="">-- Choose a Template --</option>
              {templates.map(tpl => (
                <option key={tpl.id} value={tpl.id}>{tpl.name} ({tpl.occasion})</option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            <p className="muted" style={{ fontSize: '0.9rem' }}>
              Select a template and then choose which recipients you want to generate images for using the table on the right.
            </p>
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Select Recipients ({selectedRecipientIds.size} selected)</h2>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
              <input 
                type="checkbox" 
                checked={selectedRecipientIds.size === recipients.length && recipients.length > 0} 
                onChange={handleSelectAll}
                style={{ width: '16px', height: '16px' }}
              />
              Select All
            </label>
          </div>
          
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {recipients.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No recipients found. Please add recipients first.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <tbody>
                  {recipients.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }} className="table-row-hover" onClick={() => handleToggleRecipient(r.id)}>
                      <td style={{ padding: '16px 24px', width: '40px' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedRecipientIds.has(r.id)} 
                          onChange={() => {}} // handled by row click
                          style={{ width: '16px', height: '16px', pointerEvents: 'none' }}
                        />
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <strong>{r.name}</strong><br/>
                        <span className="muted" style={{ fontSize: '0.85rem' }}>{r.email}</span>
                      </td>
                      <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>
                        <span style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--brand-primary)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 500 }}>
                          {r.occasion}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchGeneration;
