/**
 * Robô de Rastreio de Concorrência (Scheduled Function):
 * Roda 2x ao dia para rastrear novas vagas em portais públicos,
 * priorizando Baixada Fluminense e Itaguaí para inteligência competitiva.
 */
const axios = require('axios');
const cheerio = require('cheerio');
const admin = require('firebase-admin');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { logger } = require('firebase-functions');

admin.initializeApp();
const db = admin.firestore();

const TARGET_REGIONS = ['itaguaí', 'itaguai', 'baixada', 'nova iguaçu', 'duque de caxias', 'queimados', 'paracambi'];

const SOURCES = [
  {
    name: 'Isbet',
    url: 'https://www.isbet.org.br/vagas/',
    parser: ($) =>
      $('.vaga, .job-item, article').map((_, el) => ({
        title: $(el).find('h2, h3, .title').first().text().trim(),
        city: $(el).find('.cidade, .location, .local').first().text().trim(),
        link: $(el).find('a').first().attr('href') || '',
      })).get(),
  },
  {
    name: 'Nube',
    url: 'https://www.nube.com.br/vagas-estagio-aprendizagem',
    parser: ($) =>
      $('.list-item, article, .job').map((_, el) => ({
        title: $(el).find('h2, h3').first().text().trim(),
        city: $(el).find('.cidade, .local').first().text().trim(),
        link: $(el).find('a').first().attr('href') || '',
      })).get(),
  },
  {
    name: 'Infojobs',
    url: 'https://www.infojobs.com.br/empregos.aspx?provincia=rio-de-janeiro',
    parser: ($) =>
      $('.element-vaga, article, .js_vacancy').map((_, el) => ({
        title: $(el).find('h2, h3, .js_vacancyTitle').first().text().trim(),
        city: $(el).find('.location, .js_location').first().text().trim(),
        link: $(el).find('a').first().attr('href') || '',
      })).get(),
  },
];

function isTargetRegion(text = '') {
  const normalized = text.toLowerCase();
  return TARGET_REGIONS.some((region) => normalized.includes(region));
}

async function saveLeadIfNew(lead) {
  const snap = await db.collection('prospects').where('url', '==', lead.url).limit(1).get();
  if (!snap.empty) return false;

  await db.collection('prospects').add({
    nome: lead.title || 'Vaga sem título',
    cidade: lead.city || 'Não informado',
    url: lead.url || '',
    fonte: lead.source,
    status: 'Concorrência',
    origem: 'ROBO_RASTREIO',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return true;
}

async function scrapeSource(source) {
  try {
    const response = await axios.get(source.url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (BI-Rastreio-Bot)',
      },
    });

    const $ = cheerio.load(response.data);
    const rawLeads = source.parser($);

    const filtered = rawLeads
      .map((lead) => ({ ...lead, source: source.name }))
      .filter((lead) => lead.title && isTargetRegion(`${lead.title} ${lead.city}`));

    let insertedCount = 0;
    for (const lead of filtered) {
      const inserted = await saveLeadIfNew(lead);
      if (inserted) insertedCount += 1;
    }

    return { source: source.name, scanned: rawLeads.length, inserted: insertedCount };
  } catch (error) {
    logger.error(`Erro ao rastrear ${source.name}`, error);
    return { source: source.name, scanned: 0, inserted: 0, error: error.message };
  }
}

exports.rastrearConcorrenciaJob = onSchedule(
  {
    schedule: '0 */12 * * *',
    timeZone: 'America/Sao_Paulo',
    region: 'southamerica-east1',
  },
  async () => {
    logger.info('Iniciando rastreio agendado (2x ao dia).');

    const results = [];
    for (const source of SOURCES) {
      const result = await scrapeSource(source);
      results.push(result);
    }

    logger.info('Rastreio finalizado.', { results });
    return null;
  }
);
