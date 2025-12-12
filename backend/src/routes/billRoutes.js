const express = require("express")
const {BillController} = require("../controllers/billController")
const {requireAdminOrManager} = require("../middleware/auth");

const router = express.Router();
const controller = new BillController();


// TODO: add a middleware to check access for insert and update
router.post("/insert", controller.insert_new_bill.bind(controller));
router.patch("/update", controller.update_exist_bill.bind(controller));
router.get("/query-one", controller.query_a_bill.bind(controller));
router.get("/query-all", controller.query_all_bills.bind(controller));

module.exports = router;