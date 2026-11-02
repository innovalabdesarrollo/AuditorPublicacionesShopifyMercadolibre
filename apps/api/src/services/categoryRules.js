export const CATEGORY_RULES = {
  electronicos: {
    label: 'Electrónicos',
    required: ['modelo', 'voltaje', 'potencia', 'tipo_conexion', 'compatibilidad', 'dimensiones'],
    questions: [
      '¿Qué modelo exacto es?',
      '¿Es 110 V o 220 V?',
      '¿Qué potencia tiene?',
      '¿Qué tipo de conexión usa?',
      '¿Con qué dispositivos es compatible?',
      '¿Qué medidas tiene?'
    ]
  },
  autopartes: {
    label: 'Autopartes',
    required: ['marca', 'modelo', 'anio_compatible', 'vehiculos_compatibles', 'numero_parte'],
    questions: [
      '¿Es compatible con mi vehículo?',
      '¿Qué modelo exacto es?',
      '¿Para qué años aplica?',
      '¿Cuál es el número de parte?'
    ]
  },
  accesorios_tecnologicos: {
    label: 'Accesorios tecnológicos',
    required: ['dispositivos_compatibles', 'tipo_conexion', 'tamano', 'version', 'contenido_paquete'],
    questions: [
      '¿Funciona con determinado dispositivo?',
      '¿Qué tipo de conexión tiene?',
      '¿Qué tamaño / versión es?',
      '¿Qué accesorios incluye?',
      '¿Incluye cargador?',
      '¿Incluye batería?'
    ]
  },
  general: {
    label: 'General',
    required: ['marca', 'modelo', 'contenido_paquete'],
    questions: [
      '¿Qué modelo exacto es?',
      '¿Qué incluye el paquete?',
      '¿Cuáles son las medidas?'
    ]
  }
};

export function resolveCategoryKey(productCategory = '') {
  const c = productCategory.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  if (/auto|vehiculo|refaccion|parte/.test(c)) return 'autopartes';
  if (/accesorio|cable|funda|case|audifono|auricular/.test(c)) return 'accesorios_tecnologicos';
  if (/electro|gadget|tv|laptop|celular|telefono|consola|camara/.test(c)) return 'electronicos';
  return 'general';
}

export function stripHtml(html = '') {
  return String(html).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

export function extractFieldHints(text = '') {
  const t = text.toLowerCase();
  const hints = {};
  const model = text.match(/\b(?:modelo|model)\s*[:#]?\s*([A-Za-z0-9\-_.\/]+)/i);
  if (model) hints.modelo = model[1];
  const brand = text.match(/\b(?:marca|brand)\s*[:#]?\s*([A-Za-z0-9\-_.]+)/i);
  if (brand) hints.marca = brand[1];
  const volt = text.match(/(\d{2,3})\s*v(?:olt(?:ios)?)?/i);
  if (volt) hints.voltaje = `${volt[1]}V`;
  const watts = text.match(/(\d+(?:\.\d+)?)\s*w(?:atts?)?/i);
  if (watts) hints.potencia = `${watts[1]}W`;
  const capacity = text.match(/(\d+(?:\.\d+)?)\s*(?:gb|tb|mah|ml|l)\b/i);
  if (capacity) hints.capacidad = capacity[0];
  const dims = text.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)(?:\s*[x×]\s*(\d+(?:\.\d+)?))?\s*(cm|mm|m)?/i);
  if (dims) hints.dimensiones = dims[0];
  const year = text.match(/(?:años?|year|compatible)\s*(?:con|para|:)?\s*((?:19|20)\d{2}(?:\s*[-–a]\s*(?:19|20)\d{2})?)/i);
  if (year) hints.anio_compatible = year[1];
  if (/incluye\s+cargador|cargador\s+incluido/i.test(text)) hints.incluye_cargador = true;
  if (/incluye\s+bater[ií]a|bater[ií]a\s+incluida/i.test(text)) hints.incluye_bateria = true;
  if (/usb[- ]?c|lightning|hdmi|bluetooth|wifi|wi-fi/i.test(t)) {
    const m = t.match(/usb[- ]?c|lightning|hdmi|bluetooth|wi-?fi/i);
    if (m) hints.tipo_conexion = m[0];
  }
  if (/contenido\s+del\s+paquete|incluye\s*:/i.test(text)) hints.contenido_paquete = true;
  if (/compatible\s+con/i.test(text)) hints.compatibilidad = true;
  return hints;
}
