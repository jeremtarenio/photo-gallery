const router = require("express").Router();
const { upload, createPhoto, getPhotos, updateCaption, deletePhoto } = require('./photos.controller');

router.get('/', getPhotos);

router.patch('/', updateCaption);

router.post('/upload', upload);
router.post('/add', createPhoto);

router.delete('/:id', deletePhoto);

module.exports = router;
