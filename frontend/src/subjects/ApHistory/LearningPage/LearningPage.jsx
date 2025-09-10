import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../../apiClient'; // ✅ use helper functions

function LearningPage() {
  const { id } = useParams(); // chapterId
  const [subtopics, setSubtopics] = useState([]);
  const [newSubtopicName, setNewSubtopicName] = useState('');
  const [editSubId, setEditSubId] = useState(null);
  const [editSubName, setEditSubName] = useState('');

  // Fetch subtopics of chapter
  useEffect(() => {
    api
      .get(`/subtopics/${id}`)
      .then(setSubtopics)
      .catch((err) => console.error('Error fetching subtopics:', err));
  }, [id]);

  // Add new subtopic
  const addSubtopic = async () => {
    if (!newSubtopicName.trim()) return;
    try {
      const data = await api.post('/subtopics', {
        chapterId: id,
        name: newSubtopicName,
      });
      setSubtopics([...subtopics, data]);
      setNewSubtopicName('');
    } catch (error) {
      console.error('Error adding subtopic:', error);
    }
  };

  // Delete subtopic
  const deleteSubtopic = async (subId) => {
    try {
      await api.del(`/subtopics/${subId}`);
      setSubtopics(subtopics.filter((s) => s._id !== subId));
    } catch (error) {
      console.error('Error deleting subtopic:', error);
    }
  };

  // Start editing
  const startEdit = (sub) => {
    setEditSubId(sub._id);
    setEditSubName(sub.name);
  };

  // Save edit
  const saveEdit = async () => {
    try {
      const updated = await api.put(`/subtopics/${editSubId}`, {
        name: editSubName,
      });
      setSubtopics(subtopics.map((s) => (s._id === updated._id ? updated : s)));
      setEditSubId(null);
      setEditSubName('');
    } catch (error) {
      console.error('Error updating subtopic:', error);
    }
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
