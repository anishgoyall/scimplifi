const fs = require("fs");

function calculationHelper(sessionId) {
    const filenames = fs.readdirSync(`./uploads/${sessionId}`);

    let sum = 0;
    for (const filename of filenames) {
        const equation = filename.split(".")[0];
        const result = eval(equation);
        sum += result;
    }

    return sum;
}

module.exports = calculationHelper;
