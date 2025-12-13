const axios = require("axios");

async function test_query_all() {
    try {
        const res = await axios.get("http://localhost:3001/api/vehicles/query-all", {      
            params: {
                page_number: "1"
            }
        });
        console.log(JSON.stringify(res.data, null, 2));

    } catch (err) {
        console.log(err);
    }
}

//test_query_all();

async function test_query_all_with_type() {
    try {
        const res = await axios.get("http://localhost:3001/api/vehicles/count-all-by-type", {      
            params: {
                type: "car"
            }
        });
        console.log(res.data.count);

    } catch (err) {
        console.log(err);
    }
}

test_query_all_with_type();