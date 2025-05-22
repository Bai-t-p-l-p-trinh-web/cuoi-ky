module.exports.createCar = (req, res, next) => {
    const { title, location, fuel_use, price, year, km, seat_capacity } = req.body;

    if (!title) {
        return res.status(400).json({ message: "Title is required" });
    }
    if (!location || !location.query_location || !location.query_name) {
        return res.status(400).json({ message: "Valid location is required" });
    }
    if (!fuel_use || !fuel_use.fuel_type || !fuel_use.fuel_name) {
        return res.status(400).json({ message: "Valid fuel_use is required" });
    }
    if (!price || isNaN(parseInt(price))) {
        return res.status(400).json({ message: "Valid price is required" });
    }
    if (!year || isNaN(parseInt(year))) {
        return res.status(400).json({ message: "Valid year is required" });
    }
    if (!km || isNaN(parseInt(km))) {
        return res.status(400).json({ message: "Valid km is required" });
    }
    if (!seat_capacity || isNaN(parseInt(seat_capacity))) {
        return res.status(400).json({ message: "Valid seat_capacity is required" });
    }

    next();

}