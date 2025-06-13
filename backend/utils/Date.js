const generateDateRangeObject = (startDate, endDate) => {
    const result = {};

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    while (startDate <= endDate) {
        const day = String(startDate.getDate()).padStart(2, "0");
        const month = String(startDate.getMonth() + 1).padStart(2, "0");
        const year = startDate.getFullYear();

        const formatted = `${day}/${month}/${year}`;
        result[formatted] = 0; 

        startDate.setDate(startDate.getDate() + 1);
    }

    return result;
}

module.exports = {
    generateDateRangeObject
}