const{VehicleRepository} = require("../repositories/vehicleRepository");
const {PAGE_SIZE} = require("../utils/constants");


class VehicleController {
    repo;
    constructor() {
        this.repo = new VehicleRepository()
    }

    async insert_new_vehicle(req, res) {
        try {
            if (Array.isArray(req.body)) {
                throw new Error("Only one vehicle can be inserted at a time");
            }
            const {data, error} = await this.repo.insert(req.body);
            if(error) {
                throw new Error(error.message);
            }
            return res.status(200).json({message: "Success", new_vehicle: data})
        }
        catch(error) {
            return res.status(500).json({message: error.message})
        }
    }

    async delete_a_vehicle(req, res) {
        try {
            const {
                number
            } = req.body;
            if(!number) {
                throw new Error("No vehicle number found!");
            }
            const {data, error} = await this.repo.delete(number);
            if(error) {
                throw new Error(error.message);
            }
            return res.status(200).json({message: "Sucess"});
        }
        catch(error) {
            return res.status(500).json({message: error.message});
        }
    }

    async update_a_vehicle(req, res) {
        try {
            const {
                number,
                new_values
            } = req.body;
            if(!number) {
                throw new Error("No vehicle number found");
            }
            const {data, error} = await this.repo.update(new_values, number);
            if(error) {
                throw new Error(error.message);
            }
            return res.status(200).json({message: "Success", new_vehicle: data});
        }
        catch(error) {
            return res.status(500).json({message: error.message});
        }
    }

    async query_vehicles_by_owner(req, res) {
        try {
            const {
                owner
            } = req.query;
            if(!owner) {
                throw new Error("No owner found");
            } 
            const {data, error} = await this.repo.query_vehicles_by_owner(owner);
            if(error) {
                throw new Error(error.message);
            }
            return res.status(200).json({message: "Success", vehicle_list: data});
        }
        catch(error) {
            return res.status(400).json({message: error.message});
        }
    }

    async query_vehicles_by_type_and_owner(req, res) {
        try {
            const {
                owner, 
                type
            } = req.query;
            if(!owner || !type) {
                throw new Error("No owner or type found!");
            }
            const {data, error} = await this.repo.query_vehicles_by_type_and_owner(type, owner);
            if(error) {
                throw new Error(error.message);
            }
            return res.status(200).json({message: "Success", vehicle_list: data});
        }
        catch(error) {
            return res.status(500).json({message: error.message});
        }
    }

    async query_vehicles_by_apt(req, res) {
        try {
            const {
                apt_id
            } = req.query;
            if(!apt_id) {
                throw new Error("No apt found");
            } 
            const {data, error} = await this.repo.query_vehicles_by_apt(apt_id);
            if(error) {
                throw new Error(error.message);
            }
            return res.status(200).json({message: "Success", vehicle_list: data});
        }
        catch(error) {
            return res.status(400).json({message: error.message});
        }
    }

    async query_vehicles_by_type_and_apt(req, res) {
        try {
            const {
                apt_id, 
                type
            } = req.query;
            if(!apt_id || !type) {
                throw new Error("No apt or type found!");
            }
            const {data, error} = await this.repo.query_vehicles_by_type_and_apt(type, apt_id);
            if(error) {
                throw new Error(error.message);
            }
            return res.status(200).json({message: "Success", vehicle_list: data});
        }
        catch(error) {
            return res.status(500).json({message: error.message});
        }
    }


    async query_all_vehicles(req, res) {
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

            const { data, error } = await this.repo.query_all_with_range(start, end);

            if(error) {
                throw new Error(error.message);
            }

            result.data = data;
            result.current_page = page_number;
            result.page_size = PAGE_SIZE;
            const {count, error: countError} = await this.repo.count_all_vehicles();
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

    async query_all_vehicles_with_type(req, res) {
        try {
            let result = {}
            const {
                page_number,
                type
            } = req.query;
            console.log(page_number)
            if(!page_number || !type) {
                throw new Error("No page number or type found!");
            }
            const start = (page_number - 1) * PAGE_SIZE;
            const end = start + PAGE_SIZE - 1;

            const { data, error } = await this.repo.query_all_with_type_and_range(start, end, type);

            if(error) {
                throw new Error(error.message);
            }

            result.data = data;
            result.type = type;
            result.current_page = page_number;
            result.page_size = PAGE_SIZE;
            const {count, error: countError} = await this.repo.count_all_with_type(type);
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
    VehicleController
};