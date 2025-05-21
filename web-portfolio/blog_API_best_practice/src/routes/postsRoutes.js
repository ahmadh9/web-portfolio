const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/postsController");

router.get("/", ctrl.showAllPosts);           
router.get("/new", ctrl.showForm);           
router.post("/", ctrl.create);                
router.get("/edit/:id", ctrl.showEditForm);  
router.post("/:id", ctrl.update);            
router.post("/delete/:id", ctrl.remove);      

module.exports = router;
