// Import files
import { TransactionModel, UserModel, WalletModel } from "../lib/index.js";

const returnError = function(message) {
  return {
    status: "fail",
    body: {
      message: message
    }
  }
}

const authMiddleware = async (req, res, next) => {
  const {id, userId} = req.body;
  const fields = ['id', 'userId', 'walletId', 'createdAt', 'createdBy', 'currency', 'transactionStatus', 'transactionType'];
  for (const fieldIdx in fields) {
    const fieldName = fields[fieldIdx];
    if (!Object.keys(req.body).includes(fieldName) || typeof req.body[fieldName] !== "string") {
      return res.status(400).json(returnError("Bad request fields!"));
    }
  }
  if (!id || typeof id !== "string") { 
    return res.status(400).json(returnError("Invalid Transaction Body!"));
  }
  try {
    const transactionClass = new TransactionModel();
    const foundTransaction = await transactionClass.findOne(id);
    if (foundTransaction) {
      return res.status(400).json(returnError("Transaction with that ID already exists!"));
    }
    const userClass = new UserModel();
    const foundUser = await userClass.findOne(userId);
    if (!foundUser) { 
      return res.status(400).json(returnError("Could not find user with that ID!"));
    }
    const hasPermission = foundUser.transactionPermission;
    if (!hasPermission) {
      return res.status(401).json(returnError("Unauthorized!"));
    }
    const walletClass = new WalletModel();
    const foundWallet = await walletClass.getWalletByUserID(userId);
    if (!foundWallet || foundWallet.status !== "ACTIVE" || foundWallet.balance <= 0) {
      return res.status(400).json(returnError("Invalid wallet!"));
    }
  } catch(err) {
    return res.status(400).json(returnError(err.message));
  }
  next();
}

const handler = async (req, res) => {
    req.body.transactionStatus = "COMPLETE"
    const transactionClass = new TransactionModel();
    transactionClass.saveTransaction(req.body)
    .then(newTransaction => {
      res.status(200).json({
        status: "success",
        body: newTransaction
      })
    })
    .catch(err => {
      return res.status(400).json(returnError(err.message));
    })
}

export default handler;
export {authMiddleware as middleware};
