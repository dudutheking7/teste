import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function ensureLeadDocument(lead) {
  if (lead.firestoreId) return lead.firestoreId;

  const payload = {
    nome: lead.nome,
    url: lead.url || '',
    status: lead.status || 'Base Inativa',
    origem: 'KANBAN',
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, 'prospects'), payload);
  return ref.id;
}

export async function atualizarStatusLead(firestoreId, novoStatus) {
  const ref = doc(db, 'prospects', firestoreId);
  await updateDoc(ref, {
    status: novoStatus,
    updatedAt: serverTimestamp(),
  });
}
