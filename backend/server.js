import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection (change this to your MongoDB Atlas connection string later)
// mongoose.connect('mongodb://localhost:27017/historyApp', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected to Atlas'))
  .catch((err) => console.error('❌ DB Error:', err));

// Schemas
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const ChapterSchema = new mongoose.Schema({
  period: String, // Ancient, Medieval, Modern
  name: String,
  order: Number,
});

const SubtopicSchema = new mongoose.Schema({
  chapterId: mongoose.Schema.Types.ObjectId,
  name: String,
});

const NoteSchema = new mongoose.Schema({
  subtopicId: mongoose.Schema.Types.ObjectId,
  questionType: { type: String, default: 'note' }, // note, mcq, flashcard, etc.
  question: String,
  answer: String,
  options: [String], // only for mcq
});

const User = mongoose.model('User', UserSchema);
const Chapter = mongoose.model('Chapter', ChapterSchema);
const Subtopic = mongoose.model('Subtopic', SubtopicSchema);
const Note = mongoose.model('Note', NoteSchema);

// Routes
app.get('/chapters/:period', async (req, res) => {
  const chapters = await Chapter.find({ period: req.params.period }).sort(
    'order'
  );
  res.json(chapters);
});

app.post('/chapters', async (req, res) => {
  const count = await Chapter.countDocuments({ period: req.body.period }); // ✅ find how many already exist
  const newChapter = new Chapter({
    ...req.body,
    order: count, // ✅ set next position
  });
  await newChapter.save();
  res.json(newChapter);
});

// ✅ Reorder chapters
app.put('/chapters/reorder', async (req, res) => {
  const { reorderedChapters } = req.body; // array of {_id, order}
  for (let ch of reorderedChapters) {
    await Chapter.findByIdAndUpdate(ch._id, { order: ch.order });
  }
  res.json({ success: true });
});

// Update chapter
app.put('/chapters/:id', async (req, res) => {
  const updatedChapter = await Chapter.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updatedChapter);
});

// Delete chapter
app.delete('/chapters/:id', async (req, res) => {
  await Chapter.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.get('/subtopics/:chapterId', async (req, res) => {
  const subtopics = await Subtopic.find({ chapterId: req.params.chapterId });
  res.json(subtopics);
});

app.post('/subtopics', async (req, res) => {
  const newSubtopic = new Subtopic(req.body);
  await newSubtopic.save();
  res.json(newSubtopic);
});

// Update subtopic
app.put('/subtopics/:id', async (req, res) => {
  const updated = await Subtopic.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
});

// Delete subtopic
app.delete('/subtopics/:id', async (req, res) => {
  await Subtopic.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.get('/notes/:subtopicId', async (req, res) => {
  const notes = await Note.find({ subtopicId: req.params.subtopicId });
  res.json(notes);
});

app.post('/notes', async (req, res) => {
  const newNote = new Note(req.body);
  await newNote.save();
  res.json(newNote);
});

// Update note
app.put('/notes/:id', async (req, res) => {
  const updated = await Note.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
});

// Delete note
app.delete('/notes/:id', async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
