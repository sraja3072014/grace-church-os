import { getVaultData, setVaultData } from '../utils/vaultStore';

// புதிய Member-ஐச் சேமிக்கும் போது:
const handleSaveMember = async (newMemberData) => {
  // 1. தற்போது உள்ள லிஸ்ட்டை வாசித்தல்
  const currentMembers = await getVaultData('members', []);

  const newEntry = {
    id: `MEM-${Date.now().toString().slice(-4)}`,
    ...newMemberData,
    createdAt: new Date().toISOString()
  };

  const updatedList = [newEntry, ...currentMembers];

  // 2. ஹார்ட் டிஸ்க்கில் தானாக database/members.json-ல் எழுதுதல்
  await setVaultData('members', updatedList);

  console.log('Member saved to physical hard drive successfully!');
};