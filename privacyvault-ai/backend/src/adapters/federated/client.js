class FederatedClient {
  async trainLocalModel({ userId, vaultId, datasetRef }) {
    return {
      userId,
      vaultId,
      datasetRef,
      status: 'accepted_local_training',
      note: 'Model updates remain on-device in this stub adapter.'
    };
  }
}

module.exports = { federatedClient: new FederatedClient() };
