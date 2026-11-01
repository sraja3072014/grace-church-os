// src/utils/visitorConversionService.js
import { getVaultData, setVaultData } from './vaultStore';
import { getSupabase } from './supabaseClient';

export async function convertVisitorToMember(visitorId, additionalFamilyDetails = {}) {
  try {
    // 1. விசிட்டர் மற்றும் மெம்பர்ஸ் தரவுகளை லோக்கல் வோல்ட்டிலிருந்து எடுத்தல்
    const visitors = await getVaultData('visitors', []);
    const members = await getVaultData('members', []);
    const visitor = visitors.find(v => String(v.id) === String(visitorId) || String(v.visitorId) === String(visitorId));

    if (!visitor) {
      return { success: false, message: 'விசிட்டர் விவரம் கிடைக்கவில்லை!' };
    }

    // 2. டூப்ளிகேட் சரிபார்ப்பு (Duplicate Check in Members)
    const visitorPhone = String(visitor.phone || '').trim();
    const visitorName = String(visitor.name || '').trim().toLowerCase();

    const isAlreadyMember = members.some(m => {
      const head = m.headMember || {};
      const memPhone = String(head.phone || m.phone || '').trim();
      const memName = String(head.name || m.head_name || m.name || '').trim().toLowerCase();
      
      // போன் நம்பர் ஒன்றாக இருந்தாலோ அல்லது ஒரே பெயர் இருந்தாலோ தடுத்தல்
      if (visitorPhone && memPhone && visitorPhone === memPhone) return true;
      if (visitorName && memName && visitorName === memName) return true;
      return false;
    });

    if (isAlreadyMember) {
      return { 
        success: false, 
        message: 'இவர் ஏற்கெனவே உறுப்பினர்கள் (Members) பட்டியலில் உள்ளார்!' 
      };
    }

    // 3. புதிய குடும்பம் & மெம்பர் ஐடி உருவாக்குதல்
    const newFamilyId = `FAM-${Date.now().toString().slice(-6)}`;
    const newMemberId = `GCC-MBR-${Date.now().toString().slice(-4)}`;

    const newMemberRecord = {
      id: newFamilyId,
      familyId: newFamilyId,
      familyName: `${visitor.name} Household`,
      headMember: {
        memberId: newMemberId,
        name: visitor.name,
        phone: visitor.phone || '',
        latitude: visitor.latitude || '',
        longitude: visitor.longitude || '',
        gps_address: visitor.gps_address || '',
        maps_url: visitor.maps_url || '',
        gender: visitor.gender || 'Not Specified',
        campus: visitor.campus || 'Headquarters',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        source: 'Visitor Conversion'
      },
      members: [
        {
          memberId: newMemberId,
          name: visitor.name,
          relationship: 'Head',
          phone: visitor.phone || '',
          ...additionalFamilyDetails
        }
      ],
      address: visitor.address || visitor.area || '',
      latitude: visitor.latitude || '',
      longitude: visitor.longitude || '',
      gps_address: visitor.gps_address || '',
      maps_url: visitor.maps_url || '',
      createdAt: new Date().toISOString()
    };

    // 4. லோக்கல் வோல்ட்டில் Members பட்டியலில் சேர்த்தல்
    const updatedMembers = [newMemberRecord, ...members];
    await setVaultData('members', updatedMembers);

    // 5. Visitors பட்டியலில் நிலையை 'CONVERTED' என மாற்றுதல்
    const updatedVisitors = visitors.map(v => {
      if (String(v.id) === String(visitorId) || String(v.visitorId) === String(visitorId)) {
        return {
          ...v,
          funnelStage: 'CONVERTED',
          status: 'Converted to Member',
          convertedMemberId: newMemberId,
          convertedAt: new Date().toISOString()
        };
      }
      return v;
    });
    await setVaultData('visitors', updatedVisitors);

    // 6. சூப்பர்பேஸுடன் நேரடி ஒத்திசைவு (Supabase Direct Upsert)
    const supabase = getSupabase();
    if (supabase && typeof navigator !== 'undefined' && navigator.onLine) {
      // Members டேபிளில் சேர்த்தல்
      await supabase.from('members').upsert([{
        id: newFamilyId,
        family_id: newFamilyId,
        member_id: newMemberId,
        head_name: visitor.name,
        family_name: `${visitor.name} Household`,
        phone: visitor.phone || '',
        campus: visitor.campus || 'Headquarters',
         latitude: Number.isFinite(Number(visitor.latitude)) ? Number(visitor.latitude) : null,
         longitude: Number.isFinite(Number(visitor.longitude)) ? Number(visitor.longitude) : null,
         gps_address: visitor.gps_address || '',
         maps_url: visitor.maps_url || '',
        raw_payload: newMemberRecord,
        updated_at: new Date().toISOString()
      }], { onConflict: 'id' });

      // Visitors டேபிளில் ஸ்டேட்டஸ் மாற்றுதல்
      await supabase.from('visitors').upsert([{
        id: String(visitor.id),
        name: visitor.name,
        phone: visitor.phone || '',
        area: visitor.area || '',
         latitude: Number.isFinite(Number(visitor.latitude)) ? Number(visitor.latitude) : null,
         longitude: Number.isFinite(Number(visitor.longitude)) ? Number(visitor.longitude) : null,
         gps_address: visitor.gps_address || '',
         maps_url: visitor.maps_url || '',
        raw_payload: {
          ...visitor,
          funnelStage: 'CONVERTED',
          status: 'Converted to Member',
          convertedMemberId: newMemberId
        },
        updated_at: new Date().toISOString()
      }], { onConflict: 'id' });
    }

    return { 
      success: true, 
      memberId: newMemberId, 
      familyId: newFamilyId, 
      name: visitor.name 
    };

  } catch (error) {
    console.error('Visitor Conversion Failed:', error);
    return { success: false, message: error.message };
  }
}