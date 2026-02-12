const mongoose = require('mongoose');
const { Vault } = require('../../models/Vault');
const { VaultMember } = require('../../models/VaultMember');

async function assertVaultAccess({ userId, vaultId, minRole = 'viewer' }) {
  if (!mongoose.Types.ObjectId.isValid(vaultId)) return null;

  const vault = await Vault.findOne({ _id: vaultId, isDeleted: false }).lean();
  if (!vault) return null;

  if (vault.ownerId.toString() === userId) {
    return { vault, role: 'owner' };
  }

  const member = await VaultMember.findOne({ vaultId, userId, revokedAt: null }).lean();
  if (!member) return null;

  const rank = { viewer: 1, editor: 2, owner: 3 };
  if ((rank[member.role] || 0) < (rank[minRole] || 0)) {
    return null;
  }

  return { vault, role: member.role };
}

module.exports = { assertVaultAccess };
