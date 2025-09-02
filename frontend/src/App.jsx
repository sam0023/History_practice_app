import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
} from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000';

//
// ---------------------- HOME PAGE ----------------------
function Home() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Select Period</h2>
      {['Ancient', 'Medieval', 'Modern'].map((p) => (
        <button
          key={p}
          onClick={() => (window.location.href = `/chapters/${p}`)}
          style={{ display: 'block', margin: '10px' }}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

//
// ---------------------- CHAPTERS PAGE ----------------------
// --- CHAPTERS PAGE ---

function Chapters() {
  const { period } = useParams();
  const [chapters, setChapters] = useState([]);
  const [newChapterName, setNewChapterName] = useState('');
  const [editChapterId, setEditChapterId] = useState(null);
  const [editChapterName, setEditChapterName] = useState('');

  // Load chapters from backend
  useEffect(() => {
    fetch(`${API_BASE}/chapters/${period}`)
      .then((res) => res.json())
      .then(setChapters);
  }, [period]);

  // --- Add chapter (custom name) ---
  const addChapter = async () => {
    if (!newChapterName.trim()) return;
    const res = await fetch(`${API_BASE}/chapters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period, name: newChapterName }),
    });
    const data = await res.json();
    setChapters([...chapters, data]);
    setNewChapterName(''); // clear input
  };

  // --- Delete chapter ---
  const deleteChapter = async (id) => {
    await fetch(`${API_BASE}/chapters/${id}`, { method: 'DELETE' });
    setChapters(chapters.filter((ch) => ch._id !== id));
  };

  // --- Start editing ---
  const startEdit = (chapter) => {
    setEditChapterId(chapter._id);
    setEditChapterName(chapter.name);
  };

  // --- Save edited name ---
  const saveEdit = async () => {
    const res = await fetch(`${API_BASE}/chapters/${editChapterId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editChapterName }),
    });
    const updated = await res.json();
    setChapters(chapters.map((ch) => (ch._id === updated._id ? updated : ch)));
    setEditChapterId(null);
    setEditChapterName('');
  };

  // --- Handle drag & drop reorder (frontend only, not DB yet) --- // NEW

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    // Reorder locally
    const reordered = Array.from(chapters);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    // Assign new order numbers
    const updated = reordered.map((ch, index) => ({
      ...ch,
      order: index, // ✅ assign new order
    }));

    setChapters(updated); // update UI immediately

    // Save new order to backend
    await fetch(`${API_BASE}/chapters/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reorderedChapters: updated }),
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>{period} Chapters</h2>
      {/* Input for new chapter */}
      <input
        value={newChapterName}
        onChange={(e) => setNewChapterName(e.target.value)}
        placeholder="Enter chapter name"
      />
      <button onClick={addChapter}>Add Chapter</button>
      {/* Drag & Drop Wrapper */} {/* NEW */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="chapters">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {chapters.map((ch, index) => (
                <Draggable key={ch._id} draggableId={ch._id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        border: '1px solid #ccc',
                        padding: '10px',
                        margin: '5px',
                        background: '#f9f9f9',
                        ...provided.draggableProps.style,
                      }}
                    >
                      {editChapterId === ch._id ? (
                        <>
                          <input
                            value={editChapterName}
                            onChange={(e) => setEditChapterName(e.target.value)}
                          />
                          <button onClick={saveEdit}>Save</button>
                          <button onClick={() => setEditChapterId(null)}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          {index + 1}. {ch.name}
                          <br />
                          <button onClick={() => startEdit(ch)}>Edit</button>
                          <button onClick={() => deleteChapter(ch._id)}>
                            Delete
                          </button>
                          <button
                            onClick={() =>
                              (window.location.href = `/chapter/${ch._id}`)
                            }
                          >
                            Open
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

//
// ---------------------- CHAPTER PAGE ----------------------
function ChapterPage() {
  const { id } = useParams();
  return (
    <div style={{ padding: '20px' }}>
      <h2>Chapter Page</h2>
      <p>You opened Chapter ID: {id}</p>
      <button
        onClick={() => (window.location.href = `/chapter/${id}/learning`)}
      >
        Learning Mode
      </button>
      <button
        onClick={() => (window.location.href = `/chapter/${id}/practice`)}
      >
        Practice Mode
      </button>
    </div>
  );
}

// --- LEARNING PAGE ---
function LearningPage() {
  const { id } = useParams(); // chapterId
  const [subtopics, setSubtopics] = useState([]);
  const [newSubtopicName, setNewSubtopicName] = useState('');
  const [editSubId, setEditSubId] = useState(null);
  const [editSubName, setEditSubName] = useState('');

  // Load subtopics from backend
  useEffect(() => {
    fetch(`${API_BASE}/subtopics/${id}`)
      .then((res) => res.json())
      .then(setSubtopics);
  }, [id]);

  // Add subtopic
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

  // Delete subtopic
  const deleteSubtopic = async (subId) => {
    await fetch(`${API_BASE}/subtopics/${subId}`, { method: 'DELETE' });
    setSubtopics(subtopics.filter((s) => s._id !== subId));
  };

  // Start editing
  const startEdit = (sub) => {
    setEditSubId(sub._id);
    setEditSubName(sub.name);
  };

  // Save edited name
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

      {/* Input to add new subtopic */}
      <input
        value={newSubtopicName}
        onChange={(e) => setNewSubtopicName(e.target.value)}
        placeholder="Enter subtopic name"
      />
      <button onClick={addSubtopic}>Add Subtopic</button>

      {/* List subtopics */}
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

// --- SUBTOPIC PAGE ---
function SubtopicPage() {
  const { id } = useParams();
  const [notes, setNotes] = useState([]);
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');
  const [editId, setEditId] = useState(null);
  const [editQ, setEditQ] = useState('');
  const [editA, setEditA] = useState('');

  // NEW: local UI states for each note
  const [openAnswers, setOpenAnswers] = useState({});
  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenus({}); // ✅ close all menus
    };
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

  // Toggle answer visibility
  const toggleAnswer = (id) => {
    setOpenAnswers({ ...openAnswers, [id]: !openAnswers[id] });
  };

  // Toggle menu
  const toggleMenu = (id) => {
    setOpenMenus({ ...openMenus, [id]: !openMenus[id] });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Notes (Q/A)</h2>

      {/* Add new note */}
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

      {/* Render notes */}
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
            {/* --- 3 Dots Menu --- */}
            {/* --- 3 Dots Menu --- */}
            {!isEditing && (
              <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                <div style={{ position: 'relative' }}>
                  {/* 3 dots button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ stops document click
                      toggleMenu(n._id);
                    }}
                  >
                    ⋮
                  </button>

                  {/* Menu */}
                  {menuOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        top: '0', // aligned with button vertically
                        left: '110%', // ✅ pushes menu to right of button
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

            {/* --- Card Content --- */}
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

                {/* Button first, then Answer */}
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

//
// ---------------------- MAIN APP ----------------------
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chapters/:period" element={<Chapters />} />
        <Route path="/chapter/:id" element={<ChapterPage />} />
        <Route path="/chapter/:id/learning" element={<LearningPage />} />
        <Route path="/subtopic/:id" element={<SubtopicPage />} />
      </Routes>
    </Router>
  );
}

export default App;
