const{BillRepository} = require("../repositories/billRepository")
const {PAGE_SIZE} = require("../utils/constants");


class BillController {
    repo;
    constructor() {
        this.repo = new BillRepository()
    }

    async insert_new_bill(req, res) {
        try {
            const {
                apt_id,
                owner
            } = req.body;
            if(!apt_id || !owner) {
                throw new Error("No apt_id or owner found!");
            }
            const {data, error} = await this.repo.insert(req.body);
            if(error) {
                throw new Error(error.message);
            }
            return res.status(200).json({message: "Success!", new_bill: data});
        }
        catch(error) {
            return res.status(500).json({message: error.message});
        }
    }

    async update_exist_bill(req, res) {
        try {
            const {apt_id, bill} = req.body;
            if(!apt_id) {
                throw new Error("No apt_id found");
            }
            const {data, error} = await this.repo.update(bill, apt_id);
            if(error) {
                throw new Error(error.message);
            }
            return res.status(200).json({message: "Success!", new_bill: data})
        }
        catch(error) {
            return res.status(500).json({message: error.message});
        }
    }

    async query_a_bill(req, res) {
        try {
            const {apt_id} = req.query;
            const {data, error} = await this.repo.query(apt_id);
            console.log(data);
            if(error) {
                throw new Error(error.message);
            }
            return res.status(200).json({message: "Success!", data: data});
        }
        catch (error) {
            return res.status(500).json({message: error.message});
        }
    }

    async query_all_bills(req, res) {
        try {
            let result = {}
            const {
                page_number,
            } = req.query;
            console.log(page_number)
            if(!page_number) {
                throw new Error("No page number found!");
            }
            const start = (page_number - 1) * PAGE_SIZE;
            const end = start + PAGE_SIZE - 1;

            const { data, error } = await this.repo.query_with_range(start, end);

            if(error) {
                throw new Error(error.message);
            }

            result.data = data;
            result.current_page = page_number;
            result.page_size = PAGE_SIZE;
            const {count, error: countError} = await this.repo.count_all_docs();
            if(countError) {
                console.warn("Unable to retrieve total document: ", countError.message);
            }
            result.total_docs = count || 0;
            result.total_pages = Math.ceil(result.total_docs / PAGE_SIZE);

            return res.status(200).json({message: "Success", result: result});
        }
        catch(error) {
            return res.status(400).json({message: error.message});
        }
    } 
}

module.exports = {
    BillController
};