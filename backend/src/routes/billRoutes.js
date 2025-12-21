const express = require("express")
const {BillController} = require("../controllers/billController")
const {requireAdminOrManager} = require("../middleware/auth");
const { route } = require("./userRoutes");

const router = express.Router();
const controller = new BillController();


// TODO: add a middleware to check access for insert and update
router.post("/insert", controller.insert_new_bill.bind(controller));
router.patch("/update", controller.update_exist_bill.bind(controller));
router.patch("/reset", controller.reset.bind(controller));
router.post("/collect-bill", controller.collect_bill.bind(controller));

router.get("/query-one", controller.query_a_bill.bind(controller));
router.get("/query-all", controller.query_all_bills.bind(controller));
router.get("/query-by-owner", controller.query_by_owner.bind(controller));
router.get("/query-with-filter", controller.query_with_filter.bind(controller));
router.get("/query-all-collected", controller.query_sum_all.bind(controller));


module.exports = router;