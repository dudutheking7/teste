import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from './firebase';
import { geocodeAddress } from './geocodeService';

function buildLinkedinQuery(term) {
  return `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(term)}`;
}

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

  const socios = Array.isArray(data.qsa)
    ? data.qsa
    : Array.isArray(data.socios)
      ? data.socios
      : [];

  const qsa = socios.map((socio, index) => ({
    id: `${cnpjLimpo}-${index}`,
    nome: socio.nome_socio || socio.nome || 'Sócio não identificado',
    qualificacao: socio.qualificacao_socio || socio.qualificacao || 'Não informado',
    linkedinUrl: buildLinkedinQuery(`${socio.nome_socio || socio.nome || ''} ${data.razao_social || ''}`),
  }));

  return {
    exists: false,
    cnpj: cnpjLimpo,
    razaoSocial: data.razao_social,
    nomeFantasia: data.nome_fantasia,
    cnae: data.cnae_fiscal_descricao,
    municipio: data.municipio,
    uf: data.uf,
    qsa,
    linkedinRhUrl: buildLinkedinQuery(`RH ${data.razao_social || data.nome_fantasia || ''}`),
  };
}

export async function adicionarProspectAoRastreio(companyData) {
  const endereco = `${companyData.municipio || ''}, ${companyData.uf || ''}, Brasil`;
  const coords = await geocodeAddress(endereco);

  const payload = {
    cnpj: companyData.cnpj,
    razaoSocial: companyData.razaoSocial,
    cnae: companyData.cnae,
    municipio: companyData.municipio,
    uf: companyData.uf,
    source: 'CNPJ_VERIFIER',
    status: 'Rastreio',
    coordenadas: coords || null,
    createdAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, 'prospects'), payload);
  return { id: ref.id, ...payload };
}
