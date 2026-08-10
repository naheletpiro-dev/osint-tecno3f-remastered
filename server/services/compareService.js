import { scrapeCompanyWebsite } from './websiteScraperService.js';
import { searchCompanyOSINT } from './searchService.js';
import { analyzeFinancials } from './financialService.js';
import { categorizeCompany } from './categorizationService.js';
import { analyzeDigitalTransformation } from './digitalTransformationService.js';
import { generateSwotAnalysis } from './swotAnalysisService.js';
import { analyzeCompanyWithGemini } from './aiExtractionService.js';

export async function compareCompaniesOSINT(companyAData, companyBData) {
  const nameA = companyAData.companyName.trim();
  const webA = companyAData.website ? companyAData.website.trim() : null;

  const nameB = companyBData.companyName.trim();
  const webB = companyBData.website ? companyBData.website.trim() : null;

  // Scan A
  const scrapedA = await scrapeCompanyWebsite(webA, nameA);
  const searchA = await searchCompanyOSINT(nameA, webA);
  const finA = analyzeFinancials(nameA, scrapedA, searchA);
  const catA = categorizeCompany(nameA, scrapedA, searchA);
  const digA = analyzeDigitalTransformation(nameA, scrapedA, searchA);
  const swotA = generateSwotAnalysis(nameA, catA, finA, scrapedA);
  const aiA = await analyzeCompanyWithGemini(nameA, scrapedA, searchA);

  if (aiA) {
    if (aiA.sector && aiA.sector !== 'Información no verificada públicamente') catA.sector = aiA.sector;
    if (aiA.businessModel && aiA.businessModel !== 'Información no verificada públicamente') catA.businessModel = aiA.businessModel;
    if (aiA.strengths?.length > 0) swotA.strengths = aiA.strengths;
  }

  // Scan B
  const scrapedB = await scrapeCompanyWebsite(webB, nameB);
  const searchB = await searchCompanyOSINT(nameB, webB);
  const finB = analyzeFinancials(nameB, scrapedB, searchB);
  const catB = categorizeCompany(nameB, scrapedB, searchB);
  const digB = analyzeDigitalTransformation(nameB, scrapedB, searchB);
  const swotB = generateSwotAnalysis(nameB, catB, finB, scrapedB);
  const aiB = await analyzeCompanyWithGemini(nameB, scrapedB, searchB);

  if (aiB) {
    if (aiB.sector && aiB.sector !== 'Información no verificada públicamente') catB.sector = aiB.sector;
    if (aiB.businessModel && aiB.businessModel !== 'Información no verificada públicamente') catB.businessModel = aiB.businessModel;
    if (aiB.strengths?.length > 0) swotB.strengths = aiB.strengths;
  }

  return {
    reportA: {
      query: { companyName: nameA, website: webA },
      categorization: catA,
      scrapedData: scrapedA,
      financialData: finA,
      digitalTransformation: digA,
      swotAnalysis: swotA
    },
    reportB: {
      query: { companyName: nameB, website: webB },
      categorization: catB,
      scrapedData: scrapedB,
      financialData: finB,
      digitalTransformation: digB,
      swotAnalysis: swotB
    }
  };
}
