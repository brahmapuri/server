const router = require("express").Router()
const Count = require("../models/count")

router.post('/count', async (req, res) => {
  try {
    Count.findOneAndUpdate({"_id": "640ea2be1a832be6fab0ee89"},{ $inc : { people : req.body.people } },function(err, response) {
      if (err) {
        res.json(0);
      } else {
        res.json({
          success: true,
          response
        });
      }
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})

router.get('/count', async (req, res) =>{
  try {
    let people = await Count.find()
    res.json({
      success: true,
      people: people[0].people
    })
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
})

module.exports = router