const router = require("express").Router();

router.post("/chumma", (req, res) => {
    console.log(req.body);
    res.status(200).json({"resp": req.body})
})

module.exports = router;


