import "./MCQCard.css";

function MCQCard({ question, options, onAnswer }) {
  return (
    <div className="mcq-card">
      <h3>{question}</h3>
      <ul>
        {options.map((opt, index) => (
          <li key={index} onClick={() => onAnswer(opt)}>{opt}</li>
        ))}
      </ul>
    </div>
  );
}

export default MCQCard;
