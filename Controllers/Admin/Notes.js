const User = require('../../database/User');
const Admin = require("../../database/Admin")

const addNote = async (req, res) => {
  try {
    const { currentId, note } = req.body;
    const uploaderId = req.user.id
    // Get uploader details (name)
    const uploader = await Admin.findById(uploaderId);
    if (!uploader) {
      return res.status(404).json({
        errorStatus: 1,
        message: "Uploader not found",
      });
    }
    const fullName = `${uploader.firstName} ${uploader.lastName}`;

    await User.findByIdAndUpdate(currentId, {
      $push: {
        notes: {
          text: note,
          timestamp: new Date(),
          addedBy: fullName
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