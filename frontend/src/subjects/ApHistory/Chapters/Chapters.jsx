import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { api } from '../apiClient'; // ✅ use helper functions

function Chapters() {
  const { period } = useParams();
  const [chapters, setChapters] = useState([]);
  const [newChapterName, setNewChapterName] = useState('');
  const [editChapterId, setEditChapterId] = useState(null);
  const [editChapterName, setEditChapterName] = useState('');

  // Fetch chapters
  useEffect(() => {
    api
      .get(`/chapters/${period}`)
      .then(setChapters)
      .catch((err) => console.error('Error fetching chapters:', err));
  }, [period]);

  // Add chapter
  const addChapter = async () => {
    if (!newChapterName.trim()) return;
    try {
      const data = await api.post('/chapters', {
        period,
        name: newChapterName,
      });
      setChapters([...chapters, data]);
      setNewChapterName('');
    } catch (error) {
      console.error('Error adding chapter:', error);
    }
  };

  // Delete chapter
  const deleteChapter = async (id) => {
    try {
      await api.del(`/chapters/${id}`);
      setChapters(chapters.filter((ch) => ch._id !== id));
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  // Start editing
  const startEdit = (chapter) => {
    setEditChapterId(chapter._id);
    setEditChapterName(chapter.name);
  };

  // Save edit
  const saveEdit = async () => {
    try {
      const updated = await api.put(`/chapters/${editChapterId}`, {
        name: editChapterName,
      });
      setChapters(
        chapters.map((ch) => (ch._id === updated._id ? updated : ch))
      );
      setEditChapterId(null);
      setEditChapterName('');
    } catch (error) {
      console.error('Error updating chapter:', error);
    }
  };

  // Handle drag & drop reorder
  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reordered = Array.from(chapters);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    const updated = reordered.map((ch, index) => ({ ...ch, order: index }));
    setChapters(updated);

    try {
      await api.put('/chapters/reorder', { reorderedChapters: updated });
    } catch (error) {
      console.error('Error reordering chapters:', error);
    }
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
