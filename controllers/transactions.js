const { db } = require("../config");

// @desc		Get all Transactions
// @route		GET /api/v1/transactions
exports.getTransactions = async (req, res) => {
	const query = "SELECT * FROM transactions";
  try {
		const transactions = await db.query(quey);
		if (transactions.rowCount < 1) {
			return res.status(404).send({
				message: "No transactions information found"
			})
		}
		res.status(200).send({
			status: 'Success',
			message: 'Transactions information retrieved',
			data: transactions.rows,
			});
  } catch (err) {
    return res.status(500).send({
			error: err.message
		});
  }
}

// @desc		Get a Transaction
// @route		GET /api/v1/transactions/:id
exports.getTransactionById = async (req, res) => {
	const { id } = req.params;
	const query = "SELECT * FROM transactions WHERE id = $1;";

  try {
		const transaction = await db.query(query, [id]);
    if (transaction.rowCount < 1) {
      return res.status(404).send({
        message: "No transaction information found",
      });
		}
		res.status(200).send({
			status: 'Success',
			message: ' Information retrieved',
			data: transaction.rows[0],
			});
  } catch (err) {
    return res.status(500).send({
			status: 'Failure',
			error: err.message
		});
  }
};

// @desc		Update a transaction
// @route		PUT /api/v1/transactions/:id
exports.updateTransaction = async (req, res) => {
	const { id } = req.params;
	const { title, amount } = req.body;

	const transactionQuery = "SELECT * FROM transactions WHERE id = $1"
	const prevAmountQuery = "SELECT amount FROM transactions WHERE id = $1";
	const updateTransactionQuery = "UPDATE transactions SET title = $1, amount = $2 WHERE id = $3 RETURNING *";
	const updateEnvBudgetQuery =
	`UPDATE
		envelopes
	SET
		budget = (budget + $1) - $2
	WHERE
		id IN (SELECT envelope_id FROM transactions WHERE id=$3)`;

	try {
		// SQL TRANSACTION
		await db.query('BEGIN');
		const transaction = await db.query(transactionQuery, [id]);
		if (transaction.rowCount < 1) {
			return res.status(404).send({
				message: "No transaction information found"
			})
		};
		const prevAmount = await db.query(prevAmountQuery, [id]);
		await db.query(updateEnvBudgetQuery, [prevAmount.rows[0].amount, amount, id]);

		const updatedTransaction = await db.query(updateTransactionQuery, [title, amount, id]);
		await db.query('COMMIT');
		res.status(201).send({
			status: 'Success',
			message: 'Transaction has been updated',
			data: updatedTransaction.rows[0],
			});
  } catch (err) {
		await db.query('ROLLBACK');
    return res.status(500).send({
			error: err.message
		});
  }
};

// @desc		Delete a transaction
// @route		DELETE /api/v1/transactions/:id
exports.deleteTransaction = async (req, res) => {
	const { id } = req.params;
	const updateEnvBudgetQuery =
	`UPDATE
		envelopes
	SET
		budget = budget + $1
	WHERE
		id IN (SELECT envelope_id FROM transactions WHERE id=$2)`;
	const transactionQuery = "SELECT * FROM transactions WHERE id=$1"
	const transactionAmountQuery = "SELECT amount FROM transactions WHERE id = $1;"
	const deleteTransaction = "DELETE FROM transactions WHERE id=$1";

  try {
		// SQL TRANSACTION
		await db.query('BEGIN');
		const transaction = await db.query(transactionQuery, [id]);
		if (transaction.rowCount < 1) {
			return res.status(404).send({
				message: "No transaction information found"
			})
		};
		const transactionAmount = await db.query(transactionAmountQuery, [id])
		await db.query(updateEnvBudgetQuery, [transactionAmount.rows[0].amount, id]);
		await db.query(deleteTransaction, [id]);
		await db.query('COMMIT');
		res.sendStatus(204);
  } catch (err) {
		await db.query('ROLLBACK');
    return res.status(500).send({
			error: err.message
		});
  }
};