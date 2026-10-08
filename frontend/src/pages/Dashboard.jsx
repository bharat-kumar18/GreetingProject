import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/dashboard.service';

const Dashboard = () => {
  const [stats, setStats] = useState({ totalTemplates: 0, totalRecipients: 0, generatedImages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the Personalized Greeting Generator.</p>
      
      {error && (
        <div style={{ color: 'red', marginTop: '16px', padding: '12px', border: '1px solid red', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ marginTop: '32px' }}>Loading statistics...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginTop: '32px' }}>
          <div className="card">
            <h3 className="muted">Total Templates</h3>
            <h2>{stats.totalTemplates}</h2>
          </div>
          <div className="card">
            <h3 className="muted">Total Recipients</h3>
            <h2>{stats.totalRecipients}</h2>
          </div>
          <div className="card">
            <h3 className="muted">Generated Images</h3>
            <h2>{stats.generatedImages}</h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
