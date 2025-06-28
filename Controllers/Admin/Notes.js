const User = require('../../database/UserSchema');

const addNote = async (req, res) => {
  try {
    const { currentId, note } = req.body;

    await User.findByIdAndUpdate(currentId, {
      $push: {
        notes: {
          text: note,
          timestamp: new Date(),
        }
      }
    });

    res.status(200).json({
      errorStatus: 0,
      message: "Note added successfully",
    });
  } catch (error) {
    res.status(500).json({
      errorStatus: 1,
      message: "Server error while adding note",
      error: error.message,
    });
  }
};


const editNote = async (req, res) => {
  try {
    const { currentId, notesId, updatedNote } = req.body;

    await User.updateOne(
      { _id: currentId, "notes._id": notesId },
      {
        $set: {
          "notes.$.text": updatedNote,
        }
      }
    );

    res.status(200).json({
      errorStatus: 0,
      message: "Note updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      errorStatus: 1,
      message: "Server error while editing note",
      error: error.message,
    });
  }
};


const deleteNote = async (req, res) => {
  try {
    const { currentId, notesId } = req.body;

    await User.findByIdAndUpdate(currentId, {
      $pull: {
        notes: { _id: notesId }
      }
    });

    res.status(200).json({
      errorStatus: 0,
      message: "Note deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      errorStatus: 1,
      message: "Server error while deleting note",
      error: error.message,
    });
  }
};


module.exports = {
  addNote,
  editNote,
  deleteNote,
};