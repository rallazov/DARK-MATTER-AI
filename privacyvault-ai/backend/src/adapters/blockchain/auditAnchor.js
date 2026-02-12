class AuditAnchorAdapter {
  async anchorEvent({ eventId, checksum }) {
    return {
      eventId,
      checksum,
      network: 'mock-ledger',
      anchorTxId: `tx_${Date.now()}`
    };
  }
}

module.exports = { auditAnchorAdapter: new AuditAnchorAdapter() };
