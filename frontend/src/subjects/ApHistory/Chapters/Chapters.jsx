import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const API_BASE = 'http://localhost:5000';

function Chapters() {
  const { period } = useParams();
  const [chapters, setChapters] = useState([]);
  const [newChapterName, setNewChapterName] = useState('');
  const [editChapterId, setEditChapterId] = useState(null);
  const [editChapterName, setEditChapterName] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/chapters/${period}`)
      .then((res) => res.json())
      .then(setChapters);
  }, [period]);

  const addChapter = async () => {
    if (!newChapterName.trim()) return;
    const res = await fetch(`${API_BASE}/chapters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period, name: newChapterName }),
    });
    const data = await res.json();
    setChapters([...chapters, data]);
    setNewChapterName('');
  };

  const deleteChapter = async (id) => {
    await fetch(`${API_BASE}/chapters/${id}`, { method: 'DELETE' });
    setChapters(chapters.filter((ch) => ch._id !== id));
  };

  const startEdit = (chapter) => {
    setEditChapterId(chapter._id);
    setEditChapterName(chapter.name);
  };

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

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(chapters);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    const updated = reordered.map((ch, index) => ({ ...ch, order: index }));
    setChapters(updated);

    await fetch(`${API_BASE}/chapters/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reorderedChapters: updated }),
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>{period} Chapters</h2>
      <input
        value={newChapterName}
        onChange={(e) => setNewChapterName(e.target.value)}
        placeholder="Enter chapter name"
      />
      <button onClick={addChapter}>Add Chapter</button>

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

export default Chapters;
