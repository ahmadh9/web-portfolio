import React, { useState, useEffect } from 'react';
import './InstructorDashboard.css';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('courses');
  const [stats, setStats] = useState({
    totalCourses: 0, publishedCourses: 0,
    pendingCourses: 0, rejectedCourses: 0,
    totalEnrollments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchInstructorData(); }, []);

  const fetchInstructorData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return window.location.href = '/login';
      const userId = JSON.parse(atob(token.split('.')[1])).id;
      const res = await fetch('http://localhost:5000/api/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const ins = (data.courses||data||[]).filter(c=>c.instructor_id===userId);
      setCourses(ins);
      setStats({
        totalCourses: ins.length,
        publishedCourses: ins.filter(c=>c.is_published&&c.is_approved).length,
        pendingCourses: ins.filter(c=>c.status==='pending'||(!c.status&&!c.is_approved)).length,
        rejectedCourses: ins.filter(c=>c.status==='rejected').length,
        totalEnrollments: ins.reduce((s,c)=>s+(parseInt(c.students_count)||0),0)
      });
    } catch {
      console.error('Error fetching instructor data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${id}`, {
        method:'DELETE', headers:{ 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw await res.json();
      alert('Deleted');
      fetchInstructorData();
    } catch (e) {
      alert(e.error||'Delete failed');
    }
  };

  const goCreate = () => window.location.href = '/courses/create';
  const goEdit   = id => window.location.href = `/courses/${id}/edit`;
  const goView   = id => window.location.href = `/courses/${id}`;

  if (loading) return <div className="loading-container"><div className="spinner"></div><p>Loading...</p></div>;

  return (
    <div className="instructor-dashboard">
      <div className="dashboard-header">
        <div><h1>Instructor Dashboard</h1></div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={goCreate}>+ Create New Course</button>
          <button className="btn btn-secondary" onClick={()=>{localStorage.removeItem('token');window.location.href='/login';}}>
            Logout
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {/* ... same stat cards ... */}
      </div>

      {stats.rejectedCourses > 0 && (
        <div className="alert alert-warning">
          ⚠️ You have {stats.rejectedCourses} rejected course(s). Please review.
        </div>
      )}

      <div className="tabs">
        {['courses','published','pending','rejected'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab===tab?'active':''}`}
            onClick={()=>setActiveTab(tab)}
          >
            {tab==='courses'? 'All Courses' :
             tab==='published'? `Published (${stats.publishedCourses})` :
             tab==='pending'?   `Pending (${stats.pendingCourses})` :
             `Rejected (${stats.rejectedCourses})`}
          </button>
        ))}
      </div>

      <div className="content-section">
        {activeTab==='rejected' && courses.filter(c=>c.status==='rejected').map(c=>(
          <div key={c.id} className="rejected-card">
            <h3>{c.title}</h3>
            <div className="rejection-info">
              <strong>Reason:</strong> {c.rejection_reason||'—'}
            </div>
            <div className="card-actions">
              <button className="btn btn-primary" onClick={()=>goEdit(c.id)}>Edit & Resubmit</button>
              <button className="btn btn-danger"  onClick={()=>handleDelete(c.id)}>Delete</button>
            </div>
          </div>
        ))}

        {activeTab!=='rejected' && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th><th>Status</th><th>Students</th><th>Created</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses
                  .filter(c=>{
                    if(activeTab==='published') return c.is_published&&c.is_approved;
                    if(activeTab==='pending')   return c.status==='pending'||(!c.status&&!c.is_approved);
                    return true;
                  })
                  .map(c=>(
                    <tr key={c.id}>
                      <td>{c.title}</td>
                      <td>
                        <span className={`status-badge status-${c.status||'draft'}`}>
                          {c.status==='rejected'?'Rejected':
                           c.status==='pending'?'Pending':
                           c.is_published?'Published':'Draft'}
                        </span>
                      </td>
                      <td>{parseInt(c.students_count)||0}</td>
                      <td>{new Date(c.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className="btn-action btn-edit" onClick={()=>goEdit(c.id)}>Edit</button>
                        <button className="btn-action btn-delete" onClick={()=>handleDelete(c.id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
);

};

export default InstructorDashboard;
