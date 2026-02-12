async function mockPayInvoice({ amount, accountId }) {
  return {
    status: 'paid',
    amount,
    accountId,
    confirmationId: `mock_${Date.now()}`
  };
}

module.exports = { mockPayInvoice };
