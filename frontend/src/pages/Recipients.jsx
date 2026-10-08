import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import Button from '../components/Button';
import Loading from '../components/Loading';
import ErrorMsg from '../components/ErrorMsg';
import Modal from '../components/Modal';
import { Upload, Plus, Edit, Trash2, Search, Users, AlertCircle } from 'lucide-react';

const Recipients = () => {
  const [recipients, setRecipients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvSummaryModalOpen, setCsvSummaryModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({ name: '', email: '', occasion: '', greeting_date: '', message: '' });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // CSV states
  const [csvFile, setCsvFile] = useState(null);
  const [csvResult, setCsvResult] = useState(null);

  const fetchRecipients = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/recipients');
      setRecipients(res.data || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch recipients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipients();
  }, []);

  const filteredRecipients = useMemo(() => {
    return recipients.filter(r => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.occasion.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [recipients, searchTerm]);

  const handleOpenAdd = () => {
    setFormData({ name: '', email: '', occasion: '', greeting_date: '', message: '' });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (recipient) => {
    setEditingId(recipient.id);
    setFormData({ 
      name: recipient.name, 
      email: recipient.email, 
      occasion: recipient.occasion, 
      greeting_date: recipient.greeting_date ? new Date(recipient.greeting_date).toISOString().split('T')[0] : '', 
      message: recipient.message || '' 
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingId) {
        await api.put(`/recipients/${editingId}`, formData);
        setIsEditModalOpen(false);
      } else {
        await api.post('/recipients', formData);
        setIsAddModalOpen(false);
      }
      fetchRecipients();
    } catch (err) {
      setFormError(err.message || 'Failed to save recipient');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this recipient?')) return;
    try {
      await api.delete(`/recipients/${id}`);
      fetchRecipients();
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      setFormError('Please select a CSV file');
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    try {
      const data = new FormData();
      data.append('file', csvFile);
      
      const res = await api.post('/recipients/import', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setCsvResult(res.data);
      setIsCsvModalOpen(false);
      setCsvSummaryModalOpen(true);
      fetchRecipients();
    } catch (err) {
      setFormError(err.message || 'CSV Import failed');
    } finally {
      setIsSubmitting(false);
      setCsvFile(null);
    }
  };

  return (
    <div>
      <div className="flex-between mb-4">
        <div>
          <h1>Recipients</h1>
          <p>Manage people who will receive your personalized greetings.</p>
        </div>
        <div className="flex-center gap-4">
          <Button variant="secondary" onClick={() => { setCsvFile(null); setFormError(null); setIsCsvModalOpen(true); }}>
            <Upload size={18} /> Import CSV
          </Button>
          <Button onClick={handleOpenAdd}>
            <Plus size={18} /> Add Recipient
          </Button>
        </div>
      </div>

      <div className="card mb-4" style={{ padding: '16px 24px' }}>
        <div className="flex-between">
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search recipients..." 
              style={{ paddingLeft: '38px', marginTop: 0 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="muted" style={{ fontSize: '0.9rem' }}>
            Total: {recipients.length} recipients
          </div>
        </div>
      </div>

      {isLoading && <Loading message="Loading recipients..." />}
      <ErrorMsg message={error} />

      {!isLoading && !error && recipients.length === 0 && (
        <div className="card mt-4" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Users size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h2>No recipients found</h2>
          <p className="muted mb-4">You haven't added any recipients yet. Add manually or import via CSV.</p>
          <Button onClick={handleOpenAdd}>Add your first recipient</Button>
        </div>
      )}

      {!isLoading && !error && recipients.length > 0 && (
        <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Occasion</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '16px 24px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecipients.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No recipients match your search.
                  </td>
                </tr>
              ) : (
                filteredRecipients.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }} className="table-row-hover">
                    <td style={{ padding: '16px 24px' }}>{r.name}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>{r.email}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--brand-primary)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 500 }}>
                        {r.occasion}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>
                      {r.greeting_date ? new Date(r.greeting_date).toLocaleDateString() : '-'}
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button onClick={() => handleOpenEdit(r)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginRight: '16px' }} title="Edit"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(r.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }} title="Delete"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isAddModalOpen || isEditModalOpen} onClose={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} title={editingId ? 'Edit Recipient' : 'Add Recipient'}>
        <form onSubmit={handleSave}>
          <ErrorMsg message={formError} />
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input required type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input required type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Occasion *</label>
            <input required type="text" className="form-input" placeholder="e.g. Birthday" value={formData.occasion} onChange={e => setFormData({...formData, occasion: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Greeting Date</label>
            <input type="date" className="form-input" value={formData.greeting_date} onChange={e => setFormData({...formData, greeting_date: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Personal Message</label>
            <textarea className="form-input" style={{ minHeight: '80px' }} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
          </div>
          <div className="flex-between mt-4">
            <Button variant="secondary" type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Save Recipient</Button>
          </div>
        </form>
      </Modal>

      {/* CSV Upload Modal */}
      <Modal isOpen={isCsvModalOpen} onClose={() => setIsCsvModalOpen(false)} title="Import via CSV">
        <form onSubmit={handleCsvUpload}>
          <ErrorMsg message={formError} />
          <p className="muted mb-4">Upload a CSV file with columns: <strong>name, email, occasion, greeting_date, message</strong>.</p>
          <div className="form-group">
            <input type="file" accept=".csv" className="form-input" style={{ padding: '8px' }} onChange={e => setCsvFile(e.target.files[0])} />
          </div>
          <div className="flex-between mt-4">
            <Button variant="secondary" type="button" onClick={() => setIsCsvModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Upload and Parse</Button>
          </div>
        </form>
      </Modal>

      {/* CSV Result Summary Modal */}
      <Modal isOpen={csvSummaryModalOpen} onClose={() => setCsvSummaryModalOpen(false)} title="Import Summary">
        {csvResult && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div className="card" style={{ padding: '16px', borderLeft: '4px solid var(--success)', background: 'var(--bg-base)' }}>
                <h3 className="muted" style={{ fontSize: '0.85rem' }}>Successfully Imported</h3>
                <h2 style={{ color: 'var(--success)', margin: 0 }}>{csvResult.successCount}</h2>
              </div>
              <div className="card" style={{ padding: '16px', borderLeft: '4px solid var(--danger)', background: 'var(--bg-base)' }}>
                <h3 className="muted" style={{ fontSize: '0.85rem' }}>Failed Rows</h3>
                <h2 style={{ color: 'var(--danger)', margin: 0 }}>{csvResult.errorCount}</h2>
              </div>
            </div>
            
            {csvResult.errors && csvResult.errors.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={18} color="var(--danger)" /> Row-level Errors
                </h3>
                <div style={{ maxHeight: '200px', overflowY: 'auto', background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                  {csvResult.errors.map((err, idx) => (
                    <div key={idx} style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
                      <strong style={{ color: 'var(--danger)' }}>Row {err.row}:</strong> {err.errors.join(', ')}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4" style={{ textAlign: 'right' }}>
              <Button onClick={() => setCsvSummaryModalOpen(false)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Recipients;
