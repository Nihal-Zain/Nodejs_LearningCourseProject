const express = require('express');
const router = express.Router();
const subSectionsController = require('../controllers/subSectionsController/subSectionsController');

router.get('/sub-sections', subSectionsController.getAllSubSections);
router.get('/sub-sections/:id', subSectionsController.getSubSectionById);
router.post('/sub-sections', subSectionsController.createSubSection);
router.put('/sub-sections/:id', subSectionsController.updateSubSection);
router.delete('/sub-sections/:id', subSectionsController.deleteSubSection);

module.exports = router;
