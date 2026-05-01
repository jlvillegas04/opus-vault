/**
 * Seeds the items table with campaign-relevant objects.
 * Run with: npx tsx scripts/seed-items.ts
 *
 * Connects items to existing characters and locations by name lookup,
 * so run after seed-vault.ts has already populated those tables.
 */

import Database from "better-sqlite3";
import path from "path";

const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), "opus-vault.db");
const db = new Database(DB_PATH);

// ── Helpers ──────────────────────────────────────────────────────────────────

function charId(name: string): string | null {
  const row = db.prepare("SELECT id FROM characters WHERE name = ?").get(name) as { id: string } | undefined;
  return row?.id ?? null;
}

function locId(name: string): string | null {
  const row = db.prepare("SELECT id FROM locations WHERE name = ?").get(name) as { id: string } | undefined;
  return row?.id ?? null;
}

const insert = db.prepare(`
  INSERT OR IGNORE INTO items
    (id, name, description, properties, rarity, current_owner_id, current_location_id, history, created_at, updated_at)
  VALUES
    (@id, @name, @description, @properties, @rarity, @ownerId, @locationId, @history, @now, @now)
`);

const now = Math.floor(Date.now() / 1000);

function seed(item: {
  name: string;
  description: string;
  properties: string;
  rarity: string;
  owner?: string;
  location?: string;
  history: string;
}) {
  insert.run({
    id: crypto.randomUUID(),
    name: item.name,
    description: item.description,
    properties: item.properties,
    rarity: item.rarity,
    ownerId: item.owner ? charId(item.owner) : null,
    locationId: item.location ? locId(item.location) : null,
    history: item.history,
    now,
  });
  console.log(`  ✓ ${item.name}`);
}

// ── Items ─────────────────────────────────────────────────────────────────────

console.log("\nSeeding items...\n");

// ── ARTIFACT ────────────────────────────────────────────────────────────────

seed({
  name: "Cadenas del Portador",
  rarity: "artifact",
  description:
    "Cadenas invisibles que contienen la entidad encerrada dentro de Netash Vulad. No se pueden ver, pero su peso se siente en el espíritu de quienes están cerca.",
  properties:
    "Suprimen cualquier manifestación del ser contenido dentro de El Contenedor. Si las cadenas se debilitan, la entidad comienza a filtrarse hacia afuera en forma de pesadillas, anomalías arcanas y distorsiones de la realidad.\nNo pueden ser rotas por medios convencionales — sólo por la voluntad del portador o por una intervención de nivel divino.",
  history:
    "Origen desconocido. Aparecieron ligadas a Netash Vulad desde el Incidente del Obelista. Algunos académicos de la Asociación Neuf creen que fueron forjadas en los Callejones de Mercurio durante una era anterior a la fundación de las Asociaciones.",
  owner: "Netash Vulad",
});

seed({
  name: "Núcleo Replicante — Modelo Aiko",
  rarity: "artifact",
  description:
    "Una esfera compacta de cristal arcano y filamentos de mana entrelazados. Constituye la identidad fundamental de Tatsuo LaCroix, la replicante conocida como Aiko. Si este núcleo es destruido o extraído, la identidad de Aiko se fragmenta irrevocablemente.",
  properties:
    "Contiene la matriz completa de personalidad, memorias y capacidades mágicas de la replicante. Emite una señal arcana detectable por escáneres Neuf Mk. III y superiores — fue esta señal la que detonó las sospechas durante los exámenes de admisión.\nSi es analizado, revela la naturaleza exacta del tabú que Aiko representa.",
  history:
    "Fabricado en secreto por una célula no identificada de la Asociación Neuf. La existencia de replicantes de esta sofisticación es en sí misma un tabú en Opus. El núcleo fue confiscado como evidencia tras la muerte de Tatsuo LaCroix.",
  owner: "Tatsuo LaCroix",
});

// ── LEGENDARY ───────────────────────────────────────────────────────────────

seed({
  name: "Ojo Abierto",
  rarity: "legendary",
  description:
    "Un ojo cristalizado del tamaño de un puño, suspendido en una montura de metal ennegrecido. La pupila se mueve sola, siempre mirando hacia donde hay más verdad que ocultar.",
  properties:
    "Permite a su portador percibir mentiras, ilusiones y identidades ocultas en un radio de 30 metros. Una vez por día, puede proyectar en la mente de un objetivo una visión falsa tan convincente como la realidad.\nEl uso repetido sin descanso causa hemorragias en los ojos del portador.",
  history:
    "Artefacto personal de Senhu, el autoproclamado Mahdi y líder del culto El Udyat. Se dice que el ojo perteneció a un antiguo oráculo de los Callejones de Mercurio antes de que Senhu lo tomara como símbolo de su culto.",
  owner: "Senhu",
});

// ── VERY RARE ────────────────────────────────────────────────────────────────

seed({
  name: "Fragmento del Velo Carmesí",
  rarity: "very_rare",
  description:
    "Un pedazo de tela carmesí arrancado de las vestiduras de un miembro de alto rango de Las Alas de Rozzal. La tela no se desgasta ni mancha, y emite un suave calor.",
  properties:
    "Suprime la firma mágica del portador: cualquier hechizo de detección o adivinación lanzado dentro de 15 metros del fragmento muestra información falsa o distorsionada.\nSi dos o más fragmentos se combinan, el área de supresión se duplica.",
  history:
    "Los fragmentos del Velo son usados por Las Alas de Rozzal para moverse a través de Opus sin ser rastreados por las Asociaciones. Este fragmento fue recuperado en circunstancias no documentadas y su procedencia exacta es deliberadamente vaga.",
  location: "Distrito de Lilas",
});

seed({
  name: "Bitácora de Investigación de Cestra",
  rarity: "very_rare",
  description:
    "Un cuaderno de cuero desgastado lleno de notas escritas en tres idiomas distintos, esquemas de seguimiento, y recortes de informes de las Asociaciones. Huele a tinta, polvo y algo metálico.",
  properties:
    "Contiene perfiles detallados de cada anomalía activa en el Distrito de Lilas, incluyendo observaciones directas sobre Tatsuo LaCroix y la señal arcana de su núcleo replicante.\nTambién incluye notas sobre el mechón de cabello blanco — evidencia de que Cestra sabe exactamente qué es Aiko.",
  history:
    "La bitácora personal de Cestra de Rozzal, llevada durante su investigación para los Cazadores de Tabúes. Cada página es una amenaza latente para quienes encubren tabúes en Lilas.",
  owner: "Cestra de Rozzal",
});

seed({
  name: "Extracto de Kobalia",
  rarity: "very_rare",
  description:
    "Un vial de sustancia cristalina y luminiscente, de color azul eléctrico. La Asociación Desyat la usa experimentalmente en el tratamiento del Síndrome de Kobalia. Su extracción es un proceso extremadamente peligroso.",
  properties:
    "Administrado correctamente, ralentiza la progresión del Síndrome de Kobalia y reduce las manifestaciones de ego involuntarias. Dosis incorrectas aceleran el síndrome o provocan erupciones de ego no controladas.\nClasificado como sustancia prohibida fuera de los laboratorios Desyat.",
  history:
    "El extracto proviene de los residuos cristalizados de una manifestación de Kobalia controlada. La Asociación Desyat ha comenzado un protocolo experimental para tratar a Kaan Taiyo, el único caso activo documentado en Lilas.",
  location: "Distrito de Lilas",
});

// ── RARE ─────────────────────────────────────────────────────────────────────

seed({
  name: "Escáner Arcano Neuf Mk. III",
  rarity: "rare",
  description:
    "Un dispositivo de mano de acero y cristal con múltiples lentes y una aguja de medición. Emite un zumbido bajo y constante cuando está activo, que se intensifica cerca de concentraciones arcanas.",
  properties:
    "Detecta y clasifica firmas mágicas en un radio de 10 metros. Capaz de identificar tabúes activos, ego manifestaciones, y anomalías como núcleos replicantes.\nFue el mismo modelo de dispositivo que detectó las lecturas anómalas en la sangre de Aiko durante su examen de admisión a la Asociación Neuf.",
  history:
    "Desarrollado en los laboratorios de la Asociación Neuf como herramienta estándar de admisión y campo para sus Mediadores. Su versión anterior, el Mk. II, producía demasiados falsos positivos en el denso entorno arcano de Lilas.",
  location: "Distrito de Lilas",
});

seed({
  name: "Sello de Tabú",
  rarity: "rare",
  description:
    "Un disco metálico grabado con símbolos de supresión, del tamaño de una moneda grande. Frío al tacto incluso en verano. Los Cazadores de Tabúes lo portan estándar.",
  properties:
    "Al colocarse sobre un portador de tabú, crea un campo de supresión temporal que inhibe las capacidades anómalas del objetivo durante 4 horas.\nDe un solo uso — el disco se fractura tras la activación. Romper el sello antes de que expire libera la energía suprimida en una explosión arcana.",
  history:
    "Fabricado por la rama de armamento de los Cazadores de Tabúes. Cada sello está numerado y registrado. El uso indebido o la venta de sellos es sancionada con la degradación inmediata del rango del Cazador.",
  owner: "Cestra de Rozzal",
});

seed({
  name: "Daga de Filo Silencioso",
  rarity: "rare",
  description:
    "Una daga de hoja estrecha recubierta en un compuesto matte-negro extraído de la aleación subterránea de los Callejones de Mercurio. La hoja no refleja la luz y produce ningún sonido al impactar.",
  properties:
    "Las heridas infligidas con esta daga no producen sonido alguno — ni el impacto, ni el desgarro, ni el gemido. El objetivo lo nota, pero los de alrededor no.\nEl recubrimiento se degrada con ácido; un ataque con arma ácida o química neutraliza el efecto silencioso permanentemente.",
  history:
    "Equipamiento estándar de alto rango de la Asociación Shin. Magnus Cawl la recibió al ascender a Grado 4 como reconocimiento por sus operaciones de sigilo en el Nido.",
  owner: "Magnus Cawl",
});

// ── UNCOMMON ─────────────────────────────────────────────────────────────────

seed({
  name: "Guantes de Duelo Siebte",
  rarity: "uncommon",
  description:
    "Guantes de cuero reforzado con hilos de mithril en los nudillos y la palma. El dorso lleva el emblema de la Asociación Siebte grabado en plata.",
  properties:
    "Mejoran la precisión en duelos formales: el portador tiene ventaja en ataques de desarme y deflección mientras compite bajo las reglas de Siebte.\nNo ofrecen ventaja en combate no reglamentado — el encantamiento requiere que ambos contendientes reconozcan el duelo como oficial.",
  history:
    "Emitidos por la Asociación Siebte a sus Mediadores de duelo. Un par idéntico fue usado por Vespa Crabro durante su duelo sancionado contra Aida Kilet en la Rama Norte, Sección 6.",
  location: "Distrito de Lilas",
});

seed({
  name: "Tintura de Recuperación Desyat",
  rarity: "uncommon",
  description:
    "Un frasco marrón oscuro con tapón de corcho, etiquetado con la caligrafía precisa de la Asociación Desyat. Su olor es acre — hierba medicinal mezclada con cobre quemado.",
  properties:
    "Una dosis acelera la regeneración natural durante 24 horas: heridas leves se cierran en minutos, heridas moderadas en horas.\nDos dosis en 48 horas provocan fiebre arcana. Tres dosis en la misma ventana causan colapso del sistema mágico corporal.",
  history:
    "Producida en los laboratorios Desyat de la Rama Norte. Jiana Hwang, la Directora de la Sección 4, la utiliza como recompensa discreta para Mediadores recién reclutados de alto potencial.",
  location: "Distrito de Lilas",
});

seed({
  name: "Cristal de Filtro de Zahir",
  rarity: "uncommon",
  description:
    "Un prisma de cristal azul-grisáceo del tamaño de un pulgar, montado en una cadena de plata. Cuando se lleva cerca del pecho, emite un suave pulso rítmico.",
  properties:
    "Filtra la interferencia psíquica proveniente de Dal Quor, el plano de los sueños. Permite a Zahir mantener concentración y coherencia en entornos con alta actividad mental o mágica.\nFuera de su raza Quori, el cristal actúa como un focalizador arcano genérico: ventaja en tiradas de concentración.",
  history:
    "Forjado en Dal Quor antes de que Zahir renegara de su plano natal. Es uno de los pocos objetos que Zahir conserva de su vida anterior — su función práctica es secundaria a su valor como ancla de identidad.",
  owner: "Zahir, el Ojo Interior",
});

// ── COMMON ───────────────────────────────────────────────────────────────────

seed({
  name: "Amuleto del Ojo de Horus",
  rarity: "unique",
  description:
    "Un amuleto de bronce envejecido con un ojo estilizado grabado — el símbolo de El Udyat. Cabe en la palma de la mano. El iris del ojo está tallado en piedra verde translúcida.",
  properties:
    "Actúa como foco arcano: ventaja en tiradas de Sabiduría para detectar ilusiones y magias de alteración.\nEl precio desconocido: cada vez que se activa su efecto, el portador sueña con una visión del Mahdi esa noche. Las visiones son inofensivas... por ahora.",
  history:
    "Ofrecido por el enviado de Senhu durante el encuentro de la party en las Callejuelas de Lilas, con las palabras 'les protegerá en las sombras'. Su procedencia exacta dentro del culto El Udyat no está clara.",
  location: "Callejuelas de Lilas",
});

seed({
  name: "Placa de Mediador — Grado 3",
  rarity: "common",
  description:
    "Una placa rectangular de acero grabada con el rango, nombre y número de registro del Mediador. Pulida pero con marcas de uso. Reconocida en los 12 distritos de Opus.",
  properties:
    "Garantiza acceso a las instalaciones básicas de cualquier Asociación afiliada.\nFalsa o robada, puede abrir puertas — hasta que un escáner la verifique contra el registro central.",
  history:
    "Emitida a Vahl Gurn por su Asociación. Estándar y sin glamour, como el propio Vahl.",
  owner: "Vahl Gurn",
});

seed({
  name: "Los Vasos Nuevos de Danxi",
  rarity: "common",
  description:
    "Un juego de seis tazas de cerámica sin adornos, de color crema cálido. Lotto los compró en un puesto callejero de Lilas para reemplazar los viejos y desgastados de Danxi.",
  properties:
    "No tienen propiedades mágicas. Son tazas.\nSin embargo, quienes han tomado té de estas tazas en casa de Danxi reportan que saben mejor de lo esperado.",
  history:
    "Comprados por Lotto como gesto espontáneo de afecto durante la jornada en Lilas. Danxi los recibió sin mucho alboroto pero los lava a mano en lugar de dejar que los ayudantes los toquen.",
  owner: "Danxi Taiyo",
});

console.log("\nDone. Items seeded.\n");
db.close();
