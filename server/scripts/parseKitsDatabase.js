import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const kitsDir = path.resolve('../kits');
const outputDbPath = path.resolve('./data/kitsDatabase.json');

const OFFICIAL_TITLES = {
  'ges-01_gestion_operativa_0': {
    code: 'GES-01',
    category: 'Gestión',
    name: 'Kit Ges-01: Gestión Operativa Integrada, ERP & Facturación Electrónica',
    summary: 'Servicio y software para ordenar y digitalizar la gestión operativa, compras, inventarios, facturación electrónica y órdenes de producción de una PyME.'
  },
  'kit_bas-01': {
    code: 'BAS-01',
    category: 'Básico',
    name: 'Kit Bas-01: Conectividad Operacional & Ciberseguridad OT/IT',
    summary: 'Base digital segura para la planta, aislamiento de redes industriales, ciberseguridad operacional y prevención de paradas por vulnerabilidades.'
  },
  'kit_bas-02': {
    code: 'BAS-02',
    category: 'Básico',
    name: 'Kit Bas-02: Monitoreo y Visualización de Producción (OEE en Tiempo Real)',
    summary: 'Cálculo de Eficiencia General de Equipos (OEE), tableros en tiempo real, registro de micro-paradas y visibilidad del rendimiento de línea.'
  },
  'kit_bas-03': {
    code: 'BAS-03',
    category: 'Básico',
    name: 'Kit Bas-03: Planificación Simple de Producción & Secuenciamiento de Planta',
    summary: 'Organización digital de secuencias de fabricación, reducción de tiempos de setup y alineación entre pedidos de clientes y capacidad productiva.'
  },
  'kit_bas-04': {
    code: 'BAS-04',
    category: 'Básico',
    name: 'Kit Bas-04: Mantenimiento Básico & Gestión de Órdenes de Trabajo (CMMS)',
    summary: 'Inventario ordenado de activos industriales, programación de mantenimiento preventivo y control digital de órdenes de trabajo.'
  },
  'kit_bas-05': {
    code: 'BAS-05',
    category: 'Básico',
    name: 'Kit Bas-05: Eficiencia Energética & Gestión de Consumos Industriales',
    summary: 'Monitoreo de consumos eléctricos y térmicos por máquina/proceso, prevención de picos de demanda y optimización del factor de potencia.'
  },
  'kit_avz-01': {
    code: 'AVZ-01',
    category: 'Avanzado',
    name: 'Kit Avz-01: Mantenimiento Predictivo & Telemetría IoT Industrial',
    summary: 'Monitoreo continuo de vibraciones, temperatura y corriente en maquinaria crítica para anticipar fallas antes de que ocurra una parada.'
  },
  'kit_avz-02': {
    code: 'AVZ-02',
    category: 'Avanzado',
    name: 'Kit Avz-02: Control de Calidad por Visión Artificial e Inspección Automatizada',
    summary: 'Inspección óptica automatizada mediante cámaras y redes neuronales para detectar defectos superficiales y dimensionales a velocidad de línea.'
  },
  'kit_avz-03': {
    code: 'AVZ-03',
    category: 'Avanzado',
    name: 'Kit Avz-03: Trazabilidad Avanzada de Lote & Logística Digital',
    summary: 'Seguimiento con código de barras / RFID desde la materia prima hasta el cliente final, integrando logística de despacho y auditoría.'
  },
  'kit_avz-04': {
    code: 'AVZ-04',
    category: 'Avanzado',
    name: 'Kit Avz-04: Gemelo Digital, Simulación & Optimización de Planta',
    summary: 'Modelado virtual en tiempo real de la línea de producción para simular escenarios de cuellos de botella y optimizar distribuciones.'
  },
  'kit_avz-05': {
    code: 'AVZ-05',
    category: 'Avanzado',
    name: 'Kit Avz-05: Robótica Colaborativa & Automatización Industrial Avanzada',
    summary: 'Integración de cobots y celdas robotizadas para empaque, paletizado o manipulación repetitiva de alto volumen.'
  },
  'kit_avz-06': {
    code: 'AVZ-06',
    category: 'Avanzado',
    name: 'Kit Avz-06: Analítica Avanzada & Inteligencia Artificial Industrial',
    summary: 'Modelos predictivos de machine learning para optimizar parámetros operacionales, reducir mermas y mejorar el rendimiento de procesos complejos.'
  }
};

async function parseAllKits() {
  console.log('--- GENERATING ENRICHED KIT 4.0 DATABASE ---');
  if (!fs.existsSync(kitsDir)) {
    console.error('Kits directory not found at:', kitsDir);
    return;
  }

  const files = fs.readdirSync(kitsDir).filter(f => f.toLowerCase().endsWith('.pdf'));
  const database = [];

  for (const file of files) {
    const filePath = path.join(kitsDir, file);
    const dataBuffer = fs.readFileSync(filePath);
    const idKey = file.replace(/\.pdf$/i, '').toLowerCase();

    const officialMeta = OFFICIAL_TITLES[idKey] || {
      code: idKey.toUpperCase(),
      category: 'Básico',
      name: `Kit ${idKey.toUpperCase()}`,
      summary: 'Solución del Programa Kit 4.0'
    };
    
    try {
      const parser = new PDFParse(new Uint8Array(dataBuffer));
      const res = await parser.getText();
      const extractedText = typeof res === 'string' ? res : (res && typeof res.text === 'string' ? res.text : '');
      const cleanText = extractedText.replace(/\r\n/g, '\n').replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();

      database.push({
        id: idKey,
        code: officialMeta.code,
        category: officialMeta.category,
        name: officialMeta.name,
        summary: officialMeta.summary,
        filename: file,
        fullText: cleanText,
        textSnippet: cleanText.slice(0, 1500)
      });

      console.log(`✓ Indexed ${officialMeta.code}: ${officialMeta.name} (${cleanText.length} chars)`);
    } catch (err) {
      console.error(`Error parsing ${file}:`, err.message);
    }
  }

  const dbDir = path.dirname(outputDbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  fs.writeFileSync(outputDbPath, JSON.stringify(database, null, 2), 'utf8');
  console.log(`\nSuccessfully created Enriched Kit 4.0 Database at: ${outputDbPath} (${database.length} kits)`);
}

parseAllKits();
