const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');

// @desc Get all notes 
// @route GET /notes
// @access Private
const getNotes = asyncHandler( async (req , res) => {
  const notes = await Note.find().lean();
  if(!notes?.length){
    res.status(400).json({message : 'No Notes Found'});
  }

  // Add username to each note before sending the response
  const notesWithUser = await Promise.all(notes.map( async (note) => {
    const user = await User.findById(note.user).lean().exec();
    return {...note , username : user.username};
  }))
  res.json(notesWithUser);
});

const createNotes = asyncHandler( async (req , res) => {
  const {user , title , text} = req.body;
  if(!user || !title || !text) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const duplicate = await Note.findOne({title}).collation({locale : 'en' , strength : 2}).lean().exec();
  if(duplicate){
    return res.status(409).json({ message: 'Duplicate note title' })
  }
  const note = await Note.create({user , title , text});

  if(note) {
    return res.status(201).json({ message: 'New note created' })
  }else{
    return res.status(400).json({ message: 'Invalid note data received' })
  }
});

const updateNotes = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body;

  if (!id || !user || !title || !text || typeof completed !== 'boolean') {
    return res.status(400).json({ message: 'All fields are required' })
  }

  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: 'Note not found' })
  }

  const duplicate = await Note.findOne({ title }).collation({locale : 'en' , strength : 2}).lean().exec()

  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: 'Duplicate note title' })
  }

  note.user = user
  note.title = title
  note.text = text
  note.completed = completed

  const updatedNote = await note.save()

  res.json(`'${updatedNote.title}' updated`)
});

const deleteNotes = asyncHandler( async (req , res) => {
  const {id} = req.body;
  if(!id){
    return res.status(400).json({ message: 'Note ID required' })
  }
  const note = await Note.findById(id).exec();
  if(!note){
    return res.status(400).json({ message: 'Note not found' })
  }

  const result = await note.deleteOne();
  const reply = `Note '${note.title}' with ID ${note._id} deleted`
  res.json(reply)
});


module.exports = {getNotes , createNotes , updateNotes , deleteNotes};