import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

export async function consultarCnpj(cnpj) {
  const cnpjLimpo = cnpj.replace(/\D/g, '');

  const q = query(collection(db, 'empresas'), where('cnpj', '==', cnpjLimpo), where('status', '==', 'Ativo'));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    return { exists: true, message: 'CNPJ já ativo no Firestore.' };
  }

  const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
  if (!response.ok) {
    throw new Error('Não foi possível consultar o CNPJ na BrasilAPI.');
  }

  const data = await response.json();
  return {
    exists: false,
    razaoSocial: data.razao_social,
    cnae: data.cnae_fiscal_descricao,
  };
}
