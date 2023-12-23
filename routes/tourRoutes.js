const express = require('express')
const tourController = require('./../controllers/tourController')
const router = express.Router()

//router.param('id',tourController.checkId)
//parameter middleware 

router
    .route('/monthly-plan/:year')
    .get(tourController.getMonthlyPlan)
router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours)

router
    .route('/tour-stats')
    .get(tourController.getTourstats)

router
    .route('/')
    .get(tourController.getAllTours)
    .post(tourController.createTour)

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour)

module.exports = router
