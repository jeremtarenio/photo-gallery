const upload = require("../upload/upload.service");
const singleUpload = upload.single("image");
const {
  createPhoto,
  getPhotos,
  updateCaption,
  deletePhoto,
} = require("./photos.service");

module.exports = {
  upload: (req, res) => {
    singleUpload(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message,
        });
      }

      return res.status(200).json({
        success: true,
        url: req.file.location,
      });
    });
  },
  createPhoto: (req, res) => {
    const body = req.body;

    createPhoto(body, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Photo added successfully.",
      });
    });
  },
  getPhotos: (req, res) => {
    getPhotos((err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: err,
        });
      }

      return res.status(200).json({
        success: true,
        photos: results,
      });
    });
  },
  updateCaption: (req, res) => {
    const body = req.body;

    updateCaption(body, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err,
        });
      }

      return res.status(200).json({
        success: true,
        result: "Update success.",
      });
    });
  },
  deletePhoto: (req, res) => {
    const id = req.params.id;

    deletePhoto(id, (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err,
        });
      }

      return res.status(200).json({
        success: true,
        result: "Delete success.",
      });
    });
  },
};
