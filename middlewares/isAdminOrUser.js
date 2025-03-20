module.exports = (req, res, next) => {
    try {
        if(req.payload.isAdmin || req.payload._id == req.params.id) return next()
        res.status(403).send("Access denied. Not authorized.")
    } catch (error) {
        res.status(400).send(error)
    }
}

// this middile ware is used to check if the user is admin or the registed user I did this as an middle ware becasue we need to use this action couple of times and I didn't want to have code duplication