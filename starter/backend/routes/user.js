const express = require("express");
const { register, activateAccount, login } = require("../controllers/user"); //like header

const router = express.Router();

/*router.get("/user", (req, res) => {
  res.send("welcome from user home");
});*/

router.post("/register", register); //comes from controller
router.post("/activate", activateAccount);
router.post("/login", login);

module.exports = router;
