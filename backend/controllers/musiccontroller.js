const Music = require('../model/music'); 

// Controller to fetch music filtered by category
const getMusicByCategory = async (req, res) => {
    try {
      const { category } = req.query;  // Get the category from the query string
      const musicTracks = await Music.find({ category });  // Filter music by category
      res.json(musicTracks);  // Send the filtered music tracks as a JSON response
    } catch (error) {
      console.error('Error fetching music by category:', error);
      res.status(500).json({ message: 'Server error' });  // Handle errors and send a 500 status
    }
  };
  
  module.exports = { getMusicByCategory };


