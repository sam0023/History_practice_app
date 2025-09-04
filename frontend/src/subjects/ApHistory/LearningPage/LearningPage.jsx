import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = 'http://localhost:5000';

function LearningPage() {
  const { id } = useParams(); // chapterId
  const [subtopics, setSubtopics] = useState([]);
  const [newSubtopicName, setNewSubtopicName] = useState('');
  const [editSubId, setEditSubId] = useState(null);
  const [editSubName, setEditSubName] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/subtopics/${id}`)
      .then((res) => res.json())
      .then(setSubtopics);
  }, [id]);

  const addSubtopic = async () => {
    if (!newSubtopicName.trim()) return;
    const res = await fetch(`${API_BASE}/subtopics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapterId: id, name: newSubtopicName }),
    });
    const data = await res.json();
    setSubtopics([...subtopics, data]);
    setNewSubtopicName('');
  };

  const deleteSubtopic = async (subId) => {
    await fetch(`${API_BASE}/subtopics/${subId}`, { method: 'DELETE' });
    setSubtopics(subtopics.filter((s) => s._id !== subId));
  };

  const startEdit = (sub) => {
    setEditSubId(sub._id);
    setEditSubName(sub.name);
  };

  const saveEdit = async () => {
    const res = await fetch(`${API_BASE}/subtopics/${editSubId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editSubName }),
    });
    const updated = await res.json();
    setSubtopics(subtopics.map((s) => (s._id === updated._id ? updated : s)));
    setEditSubId(null);
    setEditSubName('');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Learning Mode</h2>
      <input
        value={newSubtopicName}
        onChange={(e) => setNewSubtopicName(e.target.value)}
        placeholder="Enter subtopic name"
      />
      <button onClick={addSubtopic}>Add Subtopic</button>

      {subtopics.map((s, i) => (
        <div
          key={s._id}
          style={{ border: '1px solid #ccc', margin: '5px', padding: '10px' }}
        >
          {editSubId === s._id ? (
            <>
              <input
                value={editSubName}
                onChange={(e) => setEditSubName(e.target.value)}
              />
              <button onClick={saveEdit}>Save</button>
              <button onClick={() => setEditSubId(null)}>Cancel</button>
            </>
          ) : (
            <>
              {i + 1}. {s.name}
              <br />
              <button onClick={() => startEdit(s)}>Edit</button>
              <button onClick={() => deleteSubtopic(s._id)}>Delete</button>
              <button
                onClick={() => (window.location.href = `/subtopic/${s._id}`)}
              >
                Open
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export default LearningPage;
