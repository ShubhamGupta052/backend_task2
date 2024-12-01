const express = require('express');
const Comic = require('./comicwan');
const validateToken= require("./validateToken");
const router = express.Router();


router.use(validateToken);

router.post('/', async (req, res, next) => {
  try {
    const comic = new Comic(req.body);
    await comic.save();
    res.status(201).json(comic);
  }
   catch (error) {
    res.status(400).json({ message: error.message });
  }
});//This creates new comic books

router.get('/', async (req, res, next) => {
  try {
    const comics = await Comic.find();
    res.status(200).json(comics);
  } 
  catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//Used to find a specific comic

router.get('/:name', async (req, res, next) => {
  try {
    const comic = await Comic.findById(req.params.name);
    if (!comic) 
      return res.status(404).json({ message: 'Comic not found' });
    res.status(200).json(comic);
  } 
  catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//Used to find a comic using ID

router.put('/:id', async (req, res, next) => {
  try {
    const comic = await Comic.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!comic)
       return res.status(404).json({ message: 'Comic not found' });
    res.status(200).json(comic);
    } 
  catch (error) {
    res.status(400).json({ message: error.message });
    }
});
//Used to edit a comic

router.delete('/:id', async (req, res, next) => {
  try {
    const comic = await Comic.findByIdAndDelete(req.params.id);
    if (!comic)
       return res.status(404).json({ message: 'Comic not found' });
    res.status(200).json({ message: 'Comic deleted successfully' });
  } 
  catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//Delete a comic

module.exports = router;
