const mongoose = require("mongoose");
const dbURI = process.env.DB_HOST+"/"+process.env.DB_NAME;

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection
  //   .once("open", () => {
  //     console.log("Connected");
  //   })
  .on("error", err => {
    console.log("Mongoose default connection error: " + err);
  })
  .on("connected", () => {
    console.log("Mongoose default connection open to " + dbURI);
  });
module.exports = mongoose;
