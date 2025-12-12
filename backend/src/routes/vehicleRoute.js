const express = require("express")
const {VehicleController} = require("../controllers/vehicleController")
const {requireAdminOrManager} = require("../middleware/auth");

const router = express.Router();
const controller = new VehicleController();


// TODO: add a middleware to check access for insert and update
router.post("/insert", controller.insert_new_vehicle.bind(controller));
router.patch("/update", controller.update_a_vehicle.bind(controller));
router.post("/delete", controller.delete_a_vehicle.bind(controller))
router.get("/query-by-owner", controller.query_vehicles_by_owner.bind(controller));
router.get("/query-by-owner-type", controller.query_vehicles_by_type_and_owner.bind(controller));
router.get("/query-by-apt", controller.query_vehicles_by_apt.bind(controller));
router.get("/query-by-apt-type", controller.query_vehicles_by_type_and_apt.bind(controller));
router.get("/query-all", controller.query_all_vehicles.bind(controller));
router.get("/query-all-with-type", controller.query_all_vehicles_with_type.bind(controller));

module.exports = router;