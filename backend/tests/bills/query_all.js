const axios = require("axios");

async function test_query_all() {
    try {
        const res = await axios.get("http://localhost:3001/api/bills/query-all", {      
            params: {
                page_number: "1"
            }
        });
        console.log(JSON.stringify(res.data, null, 2));

    } catch (err) {
        console.log(err);
    }
}

test_query_all();