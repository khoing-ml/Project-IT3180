import axios from "axios";
import { vehicle_type } from "./type";
import { ca } from "date-fns/locale";

const veh_type2 = ["car", "bike", "motorbike"];
const apiToStateKey: Record<string, keyof vehicle_type> = {
  car: "cars",
  bike: "bikes",
  motorbike: "motorbikes"
};

export class ApiCall {
    
    async query_vehicles_by_apt(apt_id: string) {
        try {        
            if(apt_id == "" || apt_id == null) {
                throw new Error("No apt found");
            }
            const res = await axios.get("http://localhost:3001/api/vehicles/query-by-apt", {      
                params: {
                    apt_id: apt_id
                }
            });
            return res;
        }
        catch(error) {
            throw new Error(error.message);
        }
    }
    async query_request_by_apt(apt_id: string) {
        try {
            if(apt_id == "" || apt_id == null) {
                throw new Error("No apt found");
            }
            //console.log(apt_id);
            const res = await axios.get("http://localhost:3001/api/vehicles/query-request-by-apt", {      
                params: {
                    apt_id: apt_id,
                }
            });
            //console.log(apt_id);
            //console.log("Response:", res.data);
            return res;
        } catch (err) {
            console.log(err);
        }
    }

    async count_each_type_with_apt(apt_id: string, type: string) {
        try {
            if (!apt_id) throw new Error("No apt found");
            const res = await axios.get("http://localhost:3001/api/vehicles/count-by-apt-type", {
                params: { apt_id: apt_id, type: type }
            });
            console.log(type);
            console.log(res.data.count);
            return res.data.count;
        }
        catch(error) {
            throw new Error(error.message);
        }
        
    }

    async count_each_type(type: string) {
        try {
            if (!type) throw new Error("No apt found");
            const res = await axios.get("http://localhost:3001/api/vehicles/count-all-by-type", {
                params: { type: type }
            });
            console.log(type);
            console.log(res.data.count);
            return res.data.count;
        }
        catch(error) {
            throw new Error(error.message);
        }
        
    }

    async request_new_vehicle(
        apt_id: string,
        number: string,
        type: string,
        color: string,
        owner: string
    ) {
        try {
            const res = await axios.post("http://localhost:3001/api/vehicles/insert-request", {      
                apt_id: apt_id,
                owner: owner,
                type: type,
                number: number,
                color: color
            });
            return res.data;
        }
        catch(error) {
            console.log(error.message);
            throw new Error(error.message);
        }
    }
}



