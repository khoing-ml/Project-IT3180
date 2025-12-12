const axios = require("axios");

async function test_update() {
    try {
        const res = await axios.patch("http://localhost:3001/api/bills/update", {      
            apt_id: "0A-2",
            bill: {
                owner: "admin02",
                electric: "8282828",
                water: "1212212"
            }
        });
        console.log("Response:", res.data);
    } catch (err) {
        console.log(err);
    }
}

test_update();