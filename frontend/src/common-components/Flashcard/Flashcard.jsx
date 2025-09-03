import "./Flashcard.css";

function Flashcard({ question, answer }) {
  return (
    <div className="flashcard">
      <div className="flashcard-question">{question}</div>
      <div className="flashcard-answer">{answer}</div>
    </div>
  );
}

export default Flashcard;
