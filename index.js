import express from "express";

const app = express();
const router = express.Router();

app.use(express.urlencoded());
app.use(express.json());

/*
Implement the route here
*/
import {default as TransactionRoute, middleware} from './transaction/handler.js'
app.use("/", router);
router.post(
  "/transaction", 
  middleware, 
  TransactionRoute
)
app.set("port", 7000);

const server = app.listen(app.get("port"), () => {
  console.log(`Server running → PORT ${server.address().port}`);
});
