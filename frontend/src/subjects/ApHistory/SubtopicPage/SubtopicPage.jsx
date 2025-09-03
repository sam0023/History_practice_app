import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = 'http://localhost:5000';

function SubtopicPage() {
  const { id } = useParams();
  const [notes, setNotes] = useState([]);
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');
  const [editId, setEditId] = useState(null);
  const [editQ, setEditQ] = useState('');
  const [editA, setEditA] = useState('');
  const [openAnswers, setOpenAnswers] = useState({});
  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    const handleClickOutside = () => setOpenMenus({});
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/notes/${id}`)
      .then((res) => res.json())
      .then(setNotes);
  }, [id]);

  const addNote = async () => {
    if (!newQ.trim() || !newA.trim()) return;
    const res = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subtopicId: id, question: newQ, answer: newA }),
    });
    const data = await res.json();
    setNotes([...notes, data]);
    setNewQ('');
    setNewA('');
  };

  const deleteNote = async (noteId) => {
    await fetch(`${API_BASE}/notes/${noteId}`, { method: 'DELETE' });
    setNotes(notes.filter((n) => n._id !== noteId));
  };

  const startEdit = (note) => {
    setEditId(note._id);
    setEditQ(note.question);
    setEditA(note.answer);
  };

  const saveEdit = async () => {
    const res = await fetch(`${API_BASE}/notes/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: editQ, answer: editA }),
    });
    const updated = await res.json();
    setNotes(notes.map((n) => (n._id === updated._id ? updated : n)));
    setEditId(null);
    setEditQ('');
    setEditA('');
  };

  const toggleAnswer = (id) => {
    setOpenAnswers({ ...openAnswers, [id]: !openAnswers[id] });
  };

  const toggleMenu = (id) => {
    setOpenMenus({ ...openMenus, [id]: !openMenus[id] });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Notes (Q/A)</h2>
      <input
        value={newQ}
        onChange={(e) => setNewQ(e.target.value)}
        placeholder="Enter question"
      />
      <input
        value={newA}
        onChange={(e) => setNewA(e.target.value)}
        placeholder="Enter answer"
      />
      <button onClick={addNote}>Add Note</button>

      {notes.map((n, i) => {
        const isEditing = editId === n._id;
        const showAnswer = openAnswers[n._id];
        const menuOpen = openMenus[n._id];

        return (
          <div
            key={n._id}
            style={{
              border: '1px solid #ddd',
              borderRadius: '10px',
              padding: '15px',
              margin: '10px 0',
              background: '#fff',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              position: 'relative',
            }}
          >
            {!isEditing && (
              <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu(n._id);
                    }}
                  >
                    ⋮
                  </button>
                  {menuOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        top: '0',
                        left: '110%',
                        background: '#f9f9f9',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        zIndex: 1,
                        minWidth: '100px',
                      }}
                    >
                      <button
                        onClick={() => {
                          startEdit(n);
                          toggleMenu(n._id);
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '5px',
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => {
                          deleteNote(n._id);
                          toggleMenu(n._id);
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '5px',
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {isEditing ? (
              <>
                <input
                  value={editQ}
                  onChange={(e) => setEditQ(e.target.value)}
                  placeholder="Edit question"
                  style={{
                    display: 'block',
                    marginBottom: '10px',
                    width: '100%',
                  }}
                />
                <input
                  value={editA}
                  onChange={(e) => setEditA(e.target.value)}
                  placeholder="Edit answer"
                  style={{
                    display: 'block',
                    marginBottom: '10px',
                    width: '100%',
                  }}
                />
                <button onClick={saveEdit} style={{ marginRight: '10px' }}>
                  💾 Save
                </button>
                <button onClick={() => setEditId(null)}>❌ Cancel</button>
              </>
            ) : (
              <>
                <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                  {i + 1}. {n.question}
                </p>
                <button
                  onClick={() => toggleAnswer(n._id)}
                  style={{ marginTop: '10px' }}
                >
                  {showAnswer ? 'Close' : 'Answer'}
                </button>
                {showAnswer && (
                  <p style={{ color: '#333', marginTop: '10px' }}>{n.answer}</p>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default SubtopicPage;
