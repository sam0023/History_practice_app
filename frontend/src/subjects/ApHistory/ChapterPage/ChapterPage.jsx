import { useParams } from 'react-router-dom';

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

export default ChapterPage;
