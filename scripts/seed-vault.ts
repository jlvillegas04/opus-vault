/**
 * Seed script — imports lore from the Opus Obsidian vault into the database.
 * Run with: npx tsx scripts/seed-vault.ts
 */

import { db } from "../src/lib/db";
import {
  characters,
  factions,
  locations,
  events,
  plotlines,
  notes,
  characterFactions,
  eventParticipants,
  plotlineParticipants,
} from "../src/lib/db/schema";

const id = () => crypto.randomUUID();
const NOW = new Date();

function seed() {
  console.log("🌱 Seeding Opus Vault desde el vault de Obsidian...\n");

  // ── CHARACTERS ────────────────────────────────────────────────────────────

  const C = {
    netash: id(), aida: id(), ayyib: id(), frederik: id(),
    horemheb: id(), lotto: id(), tatsuo: id(), zahir: id(),
    adrian: id(), danxi: id(), kaan: id(), lucio: id(),
    niebla: id(), cestra: id(), vahl: id(), magnus: id(),
    raika: id(), serva: id(), senhu: id(), nazir: id(),
  };

  const characterData = [
    // PCs
    {
      id: C.netash,
      name: "Netash Vulad", title: "El Contenedor",
      description: "PC. Guerrero vinculado a Zahir, el Ojo Interior — espíritu quori renegado de Dal Quor que habita en su subconsciente. Carga con la pregunta que lo persigue: ¿quién decide el propósito?",
      backstory: "Huésped involuntario de Zahir, el quori exiliado por formular la 'pregunta incorrecta'. Su alma sin dirección es precisamente lo que Zahir busca desentrañar — o destruir.",
      status: "alive" as const,
    },
    {
      id: C.aida,
      name: "Aida Kilet", title: "Kaida Abilet",
      description: "PC. Duelista. Se examinó ante Vespa Crabro en la Siebte, Rama Norte Sección 6 — marcador final 3-2 a favor de Vespa, pero calificó.",
      status: "alive" as const,
    },
    {
      id: C.ayyib,
      name: "Ayyib Yusuf",
      description: "PC. Posee magia divina — usó Zona de la Verdad en la taberna de Gladis para descubrir quién había roto un tabú. Busca poder.",
      status: "alive" as const,
    },
    {
      id: C.frederik,
      name: "Frederik Fangs",
      description: "PC. Se unió a la Asociación Zwei, Rama Norte Sección 4. Pasó sus exámenes físicos y académicos.",
      status: "alive" as const,
    },
    {
      id: C.horemheb,
      name: "Horemheb",
      description: "PC. Reclutado directamente por Jiana Hwang en la Desyat — fue fichado de antemano. Fue quien ofreció rendición a Adrian Fels tras la Segunda Fase. Escuchó el secreto de la Hana de boca de Serva.",
      status: "alive" as const,
    },
    {
      id: C.lotto,
      name: "Lotto", title: "DIM",
      description: "PC. Mencionó al Mahdi en un bar del Nido de Lilas. Le compró vasos nuevos a Danxi espontáneamente.",
      status: "alive" as const,
    },
    {
      id: C.tatsuo,
      name: "Tatsuo LaCroix", title: "Aiko",
      description: "PC. Replicante — su existencia viola un tabú de La Ciudad y la convierte en objetivo de los Cazadores de Tabúes. La Neuf tomó muestras de sangre que podrían confirmar su naturaleza. Cestra ya tiene un mechón de su cabello blanco como evidencia.",
      status: "alive" as const,
    },
    // Spirit / Companion
    {
      id: C.zahir,
      name: "Zahir, el Ojo Interior", title: "Quori Renegado de Dal Quor",
      description: "Espíritu quori exiliado del Dominio de los Fantasmas por formular la 'pregunta incorrecta'. Habita en el subconsciente de Netash. Figura flotante de 3 metros, envuelto en humo púrpura, con tres máscaras superpuestas (hueso, vidrio agrietado, carne) y un ojo cerrado en el pecho que tiembla. Solo se manifiesta en sueños inducidos, inconsciencia o trance. Cruel, inquisitivo, filosófico — habla como un predicador torturado.",
      backstory: "Fue exiliado de Dal Quor por preguntar '¿quién decide el propósito?' Busca desentrañar si el alma de Netash puede alcanzar la verdad o romperse al intentarlo. Si Netash logra encontrar su propósito, Zahir podría liberarse. Si fracasa, quedarán condenados a fundirse o fragmentarse.",
      status: "unknown" as const,
    },
    // NPCs
    {
      id: C.adrian,
      name: "Adrian Fels",
      description: "Guerrero veterano humano, ~40 años. Cabello oscuro desordenado, barba corta, sonrisa burlesca constante. Carismático, calculador y siempre listo para una broma mordaz. Inicialmente rival de la party en la Segunda Fase; la respetó después de ser derrotado.",
      backstory: "Sirvió en guerras internas de Opus. Su familia cayó en una disputa comercial. Tiene conexiones oscuras en los Callejones de Mercurio y un pasado con los Depuradores. En realidad busca un artefacto perdido que podría cambiar el equilibrio de poder en Opus — no solo restaurar el honor familiar.",
      status: "alive" as const,
    },
    {
      id: C.danxi,
      name: "Danxi Taiyo", title: "Mediadora Grado 8",
      description: "Mujer alta y enérgica con cabello rubio corto siempre despeinado. Lleva una maleta negra llena de stickers. Vivaz, extrovertida y leal, desconfía de figuras de autoridad. No afiliada a ninguna Asociación.",
      backstory: "Creció con su hermano Kaan en el orfanato de Las Alas de Rozzal. Ella fue la última en recibir la adoctrinación de EGO — proceso que Kaan interrumpió destruyendo el orfanato. Tiene un EGO incompleto y latente que desconoce. Trabaja como Mediadora para pagar los gastos de Kaan, cuya enfermedad desconoce por completo.",
      status: "alive" as const,
    },
    {
      id: C.kaan,
      name: "Kaan Taiyo",
      description: "Hermano mayor de Danxi. Hombre corpulento con cicatrices, ojos azul profundo hundidos, cabello dorado partido a la mitad, cuerpo cubierto de tatuajes. Actualmente postrado en cama por el Síndrome de Kobalia. Ex-campeón de las Arenas Clandestinas del Nido.",
      backstory: "Sobrevivió al orfanato de Rozzal y orquestó su destrucción con Mediadores misteriosos. Contrajo el Síndrome de Kobalia al consumir carne humanoide durante los experimentos. Necesita Líquido de Depurador para sobrevivir. Maneja una red de información y las Arenas desde el hospital. Detectó que el Udyat ha cortado varias de sus vías de comunicación.",
      status: "alive" as const,
    },
    {
      id: C.lucio,
      name: "Lucio Yahaan",
      description: "Mediano nervioso pero jovial, oriundo de Lilas. Piel bronceada, ojos avellana grandes, cabello rizado castaño oscuro, siempre en movimiento. Lleva una mochila llena de notas sobre Opus. Octavo miembro de la party, incorporado tras la Primera Fase.",
      backstory: "Conoce los entresijos de las Callejuelas de Lilas. Fue quien le dio a la party su primer tour por la ciudad.",
      status: "alive" as const,
    },
    {
      id: C.niebla,
      name: "Niebla",
      description: "Apariencia de 14 años, verdadera edad indescifrable. Baja, delgada, cabello blanco ondulado, ojos ámbar perla. Usa túnicas amplias de colores claros (hueso, lavanda, gris humo) con bolsillos llenos de baratijas mágicas. Huele a incienso dulce y libros antiguos. Curiosa, juguetona, desinhibida — dueña de 'Hueso y Niebla'.",
      backstory: "Fue parte accidental de un experimento fallido de Singularidad hace siglos. Su cuerpo fue reconstituido con fragmentos de la memoria de Opus, otorgándole conocimiento innato sobre la Ciudad. Sobrevivió purgas de varias facciones gracias a su neutralidad y utilidad como 'coleccionista de milagros vivos'.",
      status: "unknown" as const,
    },
    {
      id: C.cestra,
      name: "Cestra de Rozzal", title: "Cazadora de Tabúes",
      description: "Figura perturbadora, delgada y pálida. Rostro surcado de cicatrices y cortes frescos, expresión casi enfermiza de placer. Prendas raídas. Lleva una espada de hojas en espiral en la espalda. Grado aproximado 4 de los Cazadores de Tabúes.",
      backstory: "Creció en el orfanato de Las Alas de Rozzal junto a Danxi y Kaan, hecho que no recuerda. Su obsesión por los tabúes fue condicionada allí — no es del todo propia. Tiene un negocio oculto de venta de sangre de especies exóticas. Ya tiene evidencia de que Aiko es una replicante (un mechón de cabello blanco).",
      status: "alive" as const,
    },
    {
      id: C.vahl,
      name: "Vahl Gurn", title: "Mediador Grado 3",
      description: "Humanoide medio. Maestro de la Lanza con armadura de placas reforzada con runas defensivas. Disciplinado hasta el límite de su paciencia. Su lanza está grabada con sellos del Ala que se activan ante peligros. Puede usar su EGO parcial manifestado como armadura radiante.",
      backstory: "Fue el catalizador del enfrentamiento contra El Obelista en las Cloacas de Lilas. Los mediadores de Grado 4 y 5 enviados como refuerzo fueron aniquilados; Vahl necesitó a la party como catalizadores para vencer. Está al límite de su paciencia entre cumplir órdenes y seguir su propio juicio.",
      status: "alive" as const,
    },
    {
      id: C.magnus,
      name: "Magnus Cawl", title: "Mediador Grado 4 — Asociación Shin",
      description: "Cuerpo casi completamente mecánico con un solo ojo rojo brillante. Inmune a veneno, enfermedades y daño necrótico. Resistente al daño no mágico. Táctico y calculador, pero puede perder el control en combate — mató a un participante durante la Segunda Fase.",
      backstory: "Está atado a un contrato mágico con la Asociación Shin sellado con su sangre, renovable mensualmente en la Bóveda de los Sueños. Guarda una llave que abre una cámara secreta en la Librería Eterna. Sabe del soborno de Raika pero no lo reveló por camaradería.",
      status: "alive" as const,
    },
    {
      id: C.raika,
      name: "Raika Palendi", title: "Mediadora Detective Grado 5",
      description: "Shadar-Kai. Alta y delgada, piel grisácea, cabello oscuro con mechones plateados desordenados. Lleva una pipa de plata antigua legendaria (Pipa del Psicomente, cuatro tipos de aliento). Aura de aburrimiento constante que esconde una mente brillante.",
      backstory: "Examinadora de la Primera Fase del Examen. Fue sobornada por una facción enigmática para dejar pasar a ciertos candidatos. Tiene conocimientos sobre Anormalidades y puede reconocer signos tempranos. Magnus sabe de su soborno pero no lo reveló.",
      status: "alive" as const,
    },
    {
      id: C.serva,
      name: "Serva", title: "Inspector — Asociación Hana",
      description: "Humano, 42 años. Tez oscura con cicatrices, aura de autoridad silenciosa. Calmo y directo, rara vez muestra emociones. Frenó a Magnus con 'La Hana puede hacer cosas mucho peores que matarte'.",
      backstory: "Conoce los tratos sucios de la Hana — sobornos y ajustes de cuentas. Misión secreta: neutralizar a Magnus si se descontrola. Respeta a Raika profesionalmente pero desconfía de sus decisiones éticas. Empieza a cuestionar si su deber es con la ciudad o con los intereses de la Hana.",
      status: "alive" as const,
    },
    {
      id: C.senhu,
      name: "Senhu", title: "El Udyat, Ojo de la Verdad / El Mahdi",
      description: "Antagonista principal. Opera bajo los títulos 'El Mahdi' y 'El Udyat, Ojo de la Verdad'. Construye un culto en Lilas tras ser expulsado de los Callejones de Mercurio y la Rueda de Oro. Sus emisarios hablan de 'La Luz de Horus' y 'El Ojo Eterno'.",
      backstory: "Manipulador con múltiples sectas pequeñas en varios distritos. Ha cortado las vías de comunicación de Kaan Taiyo. Tiene una conexión con Zahir el quori. Su objetivo final es desconocido.",
      status: "alive" as const,
    },
    {
      id: C.nazir,
      name: "Nazir Valzur",
      description: "NPC de Lilas. Información limitada en los registros del vault.",
      status: "unknown" as const,
    },
  ];

  for (const char of characterData) {
    db.insert(characters).values({ ...char, createdAt: NOW, updatedAt: NOW }).run();
  }
  console.log(`✓ ${characterData.length} personajes`);

  // ── FACTIONS ──────────────────────────────────────────────────────────────

  const F = {
    rozzal: id(), shin: id(), zwei: id(), hana: id(), asto: id(),
    desyat: id(), siebte: id(), neuf: id(), cazadores: id(), udyat: id(),
  };

  const factionData = [
    {
      id: F.rozzal,
      name: "Las Alas de Rozzal",
      description: "Orfanato de los suburbios de Lilas donde se conducían experimentos en niños para despertar su EGO (Extensión de Gobernanza Omnisciente). Los que salieron cargaron traumas profundos o capacidades especiales. Danxi, Kaan y Cestra crecieron aquí.",
      goals: "Desarrollo y control de individuos con EGO funcional. Adoctrinamiento y manipulación de sujetos jóvenes.",
      alignment: "Lawful Evil",
    },
    {
      id: F.shin,
      name: "Asociación Shin",
      description: "Asociación de Mediadores enfocada en sigilo, combate y astucia. Su sede en Lilas es un edificio de acero y cristal con símbolos de sigilo y fuerza. Magnus Cawl (Grado 4) y Danxi Taiyo (Grado 8) son miembros.",
      goals: "Reclutar Mediadores con habilidades en combate y espionaje. Mantener contratos de sangre con miembros de élite.",
      alignment: "Lawful Neutral",
    },
    {
      id: F.zwei,
      name: "Asociación Zwei",
      description: "Asociación centrada en combate urbano, lealtad y disciplina. Frederik Fangs se examinó en su Rama Norte Sección 4.",
      goals: "Formar Mediadores de combate leal y disciplinado bajo un código de ética estricto.",
      alignment: "Lawful Neutral",
    },
    {
      id: F.hana,
      name: "Asociación Hana",
      description: "Asociación con autoridad policial y política. Supervisa a figuras de riesgo como Magnus Cawl mediante Inspectores. Conocida por operar con 'tratos sucios' en las sombras. Serva es su Inspector en el Examen.",
      goals: "Mantener el orden en los Distritos. Controlar amenazas internas. Operar políticamente detrás de escena.",
      alignment: "Lawful Neutral",
    },
    {
      id: F.asto,
      name: "Asociación Asto",
      description: "Asociación orientada al combate en equipo y el liderazgo en batalla. Valora fuerza e inteligencia táctica.",
      goals: "Fortalecer sus filas con guerreros capaces. Aplicar estrategias de combate colectivo.",
      alignment: "Neutral",
    },
    {
      id: F.desyat,
      name: "Asociación Desyat",
      description: "Asociación de sanación donde la magia se mezcla con medicina avanzada. Horemheb fue fichado directamente por su directora Jiana Hwang, Rama Norte Sección 4.",
      goals: "Proteger la vida a cualquier costo. Desarrollar técnicas de sanación mágica avanzada.",
      alignment: "Neutral Good",
    },
    {
      id: F.siebte,
      name: "Asociación Siebte",
      description: "Asociación de duelos e inteligencia. Arquitectura gótica intimidante en las Callejuelas, Barrio de las Azucenas. Cada duelo es una ceremonia con reglas estrictas. Vespa Crabro (Grado 6) examinó a Aida.",
      goals: "Recopilar inteligencia de alto valor. Reclutar Mediadores con destreza en duelos y recolección de información.",
      alignment: "Lawful Neutral",
    },
    {
      id: F.neuf,
      name: "Asociación Neuf",
      description: "Laboratorio de alta tecnología donde la magia se mezcla con maquinaria avanzada. Detectó picos mágicos inusuales en Aiko/Tatsuo y tomó muestras de sangre que podrían revelar su naturaleza de replicante.",
      goals: "Investigación y experimentación arcana. Reclutar individuos con habilidades mágicas excepcionales.",
      alignment: "True Neutral",
    },
    {
      id: F.cazadores,
      name: "Cazadores de Tabúes",
      description: "Organización que persigue y neutraliza a quienes violan los tabúes de La Ciudad. Cestra de Rozzal opera como Cazadora de Grado ~4. Están investigando activamente a Aiko/Tatsuo.",
      goals: "Purificar Opus de anomalías y violaciones de tabúes. Neutralizar a individuos como los replicantes.",
      alignment: "Lawful Neutral",
    },
    {
      id: F.udyat,
      name: "El Udyat — Culto del Ojo de la Verdad",
      description: "Culto liderado por Senhu (El Mahdi). Sus emisarios hablan de 'La Luz de Horus' y 'El Ojo Eterno'. Fue expulsado de los Callejones de Mercurio y la Rueda de Oro; ahora busca afianzarse en Lilas. Ha cortado las vías de comunicación de Kaan Taiyo.",
      goals: "Expandir la influencia de Senhu en múltiples distritos. Fin último desconocido.",
      alignment: "Chaotic Evil",
    },
  ];

  for (const faction of factionData) {
    db.insert(factions).values({ ...faction, createdAt: NOW, updatedAt: NOW }).run();
  }
  console.log(`✓ ${factionData.length} facciones`);

  // ── LOCATIONS ─────────────────────────────────────────────────────────────

  const L = {
    opus: id(), lilas: id(), entresuelo: id(), callejuelas: id(),
    nido: id(), mercurio: id(), catedral: id(), arenas: id(),
    libreria: id(), huesoNiebla: id(), telasRenna: id(), taberna: id(),
  };

  // World root first — no parent
  db.insert(locations).values({
    id: L.opus,
    name: "Opus",
    description: "La Ciudad. Epítome de la fragmentación — un mundo crudo, gigante y opresivo donde los únicos verdaderamente libres son los muertos. Coloso de hierro y piedra con doce distritos que respiran al ritmo de los que gobiernan desde las alturas.",
    locationType: "world",
    createdAt: NOW, updatedAt: NOW,
  }).run();

  // Lilas — child of Opus
  db.insert(locations).values({
    id: L.lilas,
    name: "Distrito de Lilas",
    description: "Distrito inicial de la campaña. Mezcla de decadencia y elegancia — opulencia y deterioro coexistiendo. Calles de adoquinado desgastado con enredaderas de flores violetas y esporas brillantes. Cielo eternamente cubierto de nubes lilas. 'Su impoluto aroma escondiendo los negocios que suceden debajo de la mesa.'",
    locationType: "region",
    parentLocationId: L.opus,
    createdAt: NOW, updatedAt: NOW,
  }).run();

  const sublocations = [
    {
      id: L.entresuelo,
      name: "El Entresuelo de Lilas",
      description: "Zona residencial de clase media de Lilas. Danxi y Kaan vivieron aquí después del orfanato, donde Danxi recibió educación privada.",
      locationType: "district" as const,
      parentLocationId: L.lilas,
    },
    {
      id: L.callejuelas,
      name: "Callejuelas de Lilas",
      description: "Red de callejones de comercio y negocios en los márgenes. Barrio de las Azucenas (sede Siebte). Las Telas de Renna y la Taberna de Gladis están aquí.",
      locationType: "district" as const,
      parentLocationId: L.lilas,
    },
    {
      id: L.nido,
      name: "El Nido",
      description: "Zona inferior/underground del Distrito de Lilas. Sede de las Arenas Clandestinas donde Kaan fue campeón. Bares donde Lotto mencionó al Mahdi.",
      locationType: "district" as const,
      parentLocationId: L.lilas,
    },
    {
      id: L.mercurio,
      name: "Callejones de Mercurio",
      description: "Laberintos retorcidos del mercado negro. Adrian Fels tiene conexiones aquí. El Udyat operó aquí antes de ser expulsado.",
      locationType: "district" as const,
      parentLocationId: L.lilas,
    },
    {
      id: L.catedral,
      name: "La Catedral Helada",
      description: "Bastión de silencio en Opus. Sus torres de hielo acarician los cielos nublados. Observa las intrigas de La Ciudad con ojos de mármol. Distrito inicial previsto para Opus 2.0.",
      locationType: "building" as const,
      parentLocationId: L.opus,
    },
    {
      id: L.arenas,
      name: "Arenas Clandestinas del Nido",
      description: "Arenas de pelea clandestina en El Nido. Kaan Taiyo se alzó como campeón aquí y luego tomó el control. Actualmente las maneja desde el hospital a través de su socio Barús.",
      locationType: "building" as const,
      parentLocationId: L.nido,
    },
    {
      id: L.libreria,
      name: "La Librería Eterna",
      description: "Una de las alas de Opus. Sus páginas susurran conocimientos prohibidos. Plutón la visitó hace 10 años buscando el 'Libro Perfecto' — creado por Némora tras las Noches Luminosas y Días Oscuros. Magnus guarda una llave de una cámara secreta aquí. La biblioteca de Aethir en las Callejuelas fue destruida por 'hablar de más'.",
      locationType: "building" as const,
      parentLocationId: L.opus,
    },
    {
      id: L.huesoNiebla,
      name: "Hueso y Niebla",
      description: "La tienda de Niebla. Atmósfera cálida, perfumada y acogedora — como una biblioteca perdida entre mundos. El aire siempre está ligeramente cargado de energía mágica. Protegida por conjuros de dislocación espacial, anti-rastreo y anti-scrutiny mágico.",
      locationType: "building" as const,
      parentLocationId: L.callejuelas,
    },
    {
      id: L.telasRenna,
      name: "Las Telas de Renna",
      description: "Tienda de telas en las Callejuelas de Lilas. Renna es una mujer adulta elfa apasionada por las telas. Visitada por la party en la Sesión 001.",
      locationType: "building" as const,
      parentLocationId: L.callejuelas,
    },
    {
      id: L.taberna,
      name: "Taberna de Gladis",
      description: "Taberna de confianza de la party en las Callejuelas de Lilas, manejada por la semi-orca Gladis. Aquí la party usó Zona de la Verdad para descubrir que Aiko es una replicante (Sesión 007).",
      locationType: "building" as const,
      parentLocationId: L.callejuelas,
    },
  ];

  for (const loc of sublocations) {
    db.insert(locations).values({ ...loc, createdAt: NOW, updatedAt: NOW }).run();
  }
  console.log(`✓ ${sublocations.length + 2} locaciones`);

  // ── EVENTS ────────────────────────────────────────────────────────────────

  const E = {
    s1: id(), s2: id(), s3: id(), s4: id(),
    s5: id(), s6: id(), s7: id(), obelista: id(),
  };

  const eventData = [
    {
      id: E.s1,
      title: "001 — El centésimo examen de Mediador",
      description: "Primera sesión. Plaza del Ángel de Lilas: Primera Fase del Examen. Raika Palendi explica las reglas con indiferencia. La party descubre el método alternativo (alcanzar la pipa de Raika). Raika deja pasar a los restantes — fue sobornada previamente. Conocen a Lucio Yahaan. Tour por las Callejuelas de Lilas.",
      sessionNumber: 1,
      consequences: "La party pasa a la Segunda Fase. Lucio Yahaan se une como guía. Primera exposición al sistema de Mediadores.",
    },
    {
      id: E.s2,
      title: "002 — Cazadores y liebres (Parte 1)",
      description: "Segunda Fase del Examen: 15 equipos en arena con misión de capturar liebres enemigas. La party hace un trato dudoso con el equipo de Adrian Fels. Combate contra el equipo de Nia Selk. La party acumula 4 puntos.",
      sessionNumber: 2,
      consequences: "Primer encuentro con Adrian Fels. La party demuestra su brutalidad táctica. Conexión con Kaan Taiyo a través de Danxi.",
    },
    {
      id: E.s3,
      title: "003 — Cazadores y liebres (Parte 2)",
      description: "Combate contra el equipo de Adrian Fels — la party gana y captura 2 liebres para pasar. Horemheb ofrece rendición a Adrian. Magnus Cawl mata a un participante en el tercer batch y Serva lo contiene con 'La Hana puede hacer cosas mucho peores que matarte'. Visita nocturna a Kaan — revelan el Síndrome de Kobalia.",
      sessionNumber: 3,
      consequences: "Adrian respeta a la party. Magnus se desestabiliza (mata a un participante). La party conoce el Síndrome de Kobalia. Horemheb escucha el secreto de la Hana.",
    },
    {
      id: E.s4,
      title: "004 — La última fase",
      description: "Tercera Fase del Examen: carruaje de la Hana (2 horas, cortinas cerradas). Resulta ser una inducción básica de Mediadores dirigida por Plutón. El examen abarcó todos los distritos: 639 nuevos mediadores. Solo Mott Valáez queda en Grado 6. La biblioteca de Aethir fue destruida y Aethir murió 'por hablar de más'.",
      sessionNumber: 4,
      consequences: "La party se convierte en Mediadores. Mott Valáez es el único Grado 6. La destrucción de la biblioteca de Aethir es una pista latente.",
    },
    {
      id: E.s5,
      title: "005 — Las Asociaciones",
      description: "La party explora sedes de Asociaciones en Lilas: Shin, Zwei, Asto, Desyat, Neuf. La Neuf detecta picos mágicos inusuales en Aiko/Tatsuo y pide exámenes de sangre. Primer avistamiento de un emisario del Udyat.",
      sessionNumber: 5,
      consequences: "La Neuf tiene muestras de sangre de Aiko — bomba de tiempo. Primer contacto con el culto del Udyat.",
    },
    {
      id: E.s6,
      title: "006 — Explorando nuevas alianzas",
      description: "Continuación de visitas a Asociaciones. Frederik completa exámenes en la Zwei. Aiko acepta análisis de sangre en la Neuf. Un enviado del Udyat aparece en callejón oscuro y ofrece un amuleto del Ojo de Horus.",
      sessionNumber: 6,
      consequences: "Frederik entra a la Zwei. Los análisis de sangre de Aiko están pendientes. La presencia del Udyat se vuelve más directa.",
    },
    {
      id: E.s7,
      title: "007 — La caza comienza",
      description: "Aida se examina ante Vespa Crabro en la Siebte (3-2, califica). Horemheb es reclutado por Jiana Hwang en Desyat. Cestra de Rozzal aparece y advierte que alguien rompió un tabú en la zona. En la taberna de Gladis, Ayyib usa Zona de la Verdad: la party descubre que Aiko/Tatsuo es una replicante. Cestra ya lo sabe (tiene el mechón de cabello blanco).",
      sessionNumber: 7,
      consequences: "Cestra sabe. La party debe proteger a Aiko. Aida califica para la Siebte. Horemheb entra a la Desyat.",
    },
    {
      id: E.obelista,
      title: "El Incidente del Obelista",
      description: "Distorsión de nivel 'Pesadilla de La Ciudad' en las Cloacas de Lilas. El Obelista — arquitecto monstruoso que habla en lenguaje de construcción — generó cristales negros y absorbió cadáveres para regenerarse. Mediadores de Grado 4 y 5 enviados como refuerzo fueron eliminados. La party asistió a Vahl Gurn (Grado 3) como catalizadores de la victoria.",
      sessionNumber: null,
      consequences: "El Obelista neutralizado. Vahl sobrevivió. Los mediadores de refuerzo murieron. Clasificado como 'Neutralizado' por el sistema.",
    },
  ];

  for (const event of eventData) {
    db.insert(events).values({ ...event, createdAt: NOW, updatedAt: NOW }).run();
  }
  console.log(`✓ ${eventData.length} eventos`);

  // ── PLOTLINES ─────────────────────────────────────────────────────────────

  const P = {
    examen: id(), kobalia: id(), udyat: id(), replicante: id(), rozzal: id(),
  };

  const plotlineData = [
    {
      id: P.examen,
      title: "El Examen de Mediador",
      description: "Los PCs tomaron el Centésimo Examen de Mediador en el Distrito de Lilas. Tres fases: identificación de grupo, arena de liebres, inducción. Raika fue sobornada para dejar pasar a ciertos candidatos.",
      status: "resolved" as const,
      hooks: "¿Quién sobornó a Raika y con qué propósito? ¿Qué significa ser Mediador en Opus? Mott Valáez quedó en Grado 6 — el único de 639. ¿Por qué?",
      complications: "Magnus mató a un participante. La Hana tiene secretos que Serva cuestiona. 639 nuevos mediadores en todos los distritos cambian el equilibrio.",
      potentialResolutions: "Resuelto — la party es Mediadores. Las consecuencias políticas del examen aún se desarrollan.",
    },
    {
      id: P.kobalia,
      title: "El Síndrome de Kobalia de Kaan",
      description: "Kaan Taiyo está postrado en cama con el Síndrome de Kobalia — enfermedad degenerativa tabú vinculada al consumo de carne humana. La única cura conocida es el Líquido de Depurador.",
      status: "active" as const,
      hooks: "Kaan mueve hilos desde el hospital para conseguir los viales. Detectó que el Udyat ha cortado sus vías de comunicación. Barús (su socio enano) puede ser punto de contacto.",
      complications: "El Síndrome es un tabú absoluto — si se descubre, Kaan sería perseguido. Los Depuradores no venden fácilmente su líquido. Danxi no sabe nada de la enfermedad de su hermano.",
      potentialResolutions: "Conseguir viales de Líquido de Depurador. Encontrar cura alternativa. Aceptar el deterioro.",
    },
    {
      id: P.udyat,
      title: "El Udyat — El Mahdi",
      description: "Senhu construye un culto en Lilas tras ser expulsado de los Callejones de Mercurio y la Rueda de Oro. Sus emisarios hablan de 'La Luz de Horus' y 'El Ojo Eterno'. Tiene una conexión con Zahir el quori.",
      status: "active" as const,
      hooks: "Un emisario ofreció un Amuleto del Ojo de Horus a la party. Kaan notó que el Udyat cortó sus canales. Lotto mencionó al Mahdi en un bar. La conexión con Zahir amenaza directamente a Netash.",
      complications: "Opera en múltiples distritos con sectas pequeñas. Su objetivo final es desconocido. Su conexión con Zahir es una amenaza existencial para Netash.",
      potentialResolutions: "Confrontar y neutralizar a Senhu. Descubrir su conexión con Zahir. Unirse al culto (opción corrupta).",
    },
    {
      id: P.replicante,
      title: "Aiko la Replicante",
      description: "Tatsuo LaCroix es una replicante — su existencia viola un tabú de La Ciudad. Cestra de Rozzal ya lo sabe (tiene el mechón de cabello blanco como evidencia). La Neuf tiene muestras de sangre pendientes de análisis.",
      status: "active" as const,
      hooks: "Cestra investiga activamente. Los análisis de sangre de la Neuf pueden confirmar la naturaleza de Aiko. ¿Quién creó a Tatsuo y por qué?",
      complications: "Si la verdad se confirma, Aiko es objetivo inmediato de los Cazadores. La party debe decidir cómo protegerla. Cestra tiene más recursos de los que parece.",
      potentialResolutions: "Eliminar la evidencia (Neuf + Cestra). Encontrar protección política. Huir del Distrito. Enfrentar a Cestra directamente.",
    },
    {
      id: P.rozzal,
      title: "La Conspiración de Las Alas de Rozzal",
      description: "El orfanato de Rozzal condujo experimentos de EGO en niños. Cestra, Danxi y Kaan crecieron allí. Kaan guarda documentos que incriminan a figuras del Ala. El EGO latente de Danxi podría manifestarse de forma incontrolable.",
      status: "dormant" as const,
      hooks: "Danxi no recuerda los detalles. Kaan guarda los documentos de incriminación. Cestra no recuerda su infancia en Rozzal. El EGO fracturado de Danxi es el secreto más grande de Kaan.",
      complications: "Las figuras incriminadas siguen en posiciones de poder. El EGO de Danxi podría volverse incontrolable. Cestra podría recuperar sus memorias.",
      potentialResolutions: "Exponer a los responsables de Rozzal. Activar o controlar el EGO de Danxi. Usar los documentos de Kaan como palanca política.",
    },
  ];

  for (const plot of plotlineData) {
    db.insert(plotlines).values({ ...plot, createdAt: NOW, updatedAt: NOW }).run();
  }
  console.log(`✓ ${plotlineData.length} tramas`);

  // ── NOTES ─────────────────────────────────────────────────────────────────

  const noteData = [
    {
      id: id(),
      title: "Visión de Opus",
      content: `# Qué es Opus

> Opus es la epítome de la fragmentación, un mundo crudo, gigante y opresivo en el que los únicos verdaderamente libres de su maldición son los muertos.

## Temas centrales
- Existencialismo
- La magnitud de una sociedad opresiva
- Moralidad gris

## Niveles de amenaza en Opus

- **Mito Urbano** — Incidentes anómalos de baja intensidad. Registros inconsistentes, sin voluntad clara detrás.
- **Leyenda Urbana** — Amenazas con comportamiento repetible y víctimas confirmadas. Adquieren identidad: nombre, rutina, territorio.
- **Plaga Urbana** — Amenazas que se diseminan o persisten tras la intervención. La erradicación genera variantes.
- **Pesadilla de La Ciudad** — Capacidad sostenida de aniquilación. La Hana interviene. *El Obelista era de este nivel.*
- **Estrella de La Ciudad** — Anomalías que amenazan un Distrito entero. Toda la maquinaria del Ala se centra en apagarla.
- **Impuritas Civitalis** — Máximo nivel. Solo Mediadores Grado 1 y Colores pueden intervenir. La Ciudad para su producción.

## Foco
- El Examen de Mediador fue el arco introductorio en el Distrito de Lilas.
- Opus 2.0 tiene previsto el Distrito inicial: La Catedral Helada.`,
      createdAt: NOW, updatedAt: NOW,
    },
    {
      id: id(),
      title: "Zahir — Frases y notas de interpretación",
      content: `# Zahir, el Ojo Interior — Frases

## En sueños inducidos o inconsciencia
- "¿Sigues buscando respuestas, pequeño contenedor? El silencio te teme, pero yo no."
- "Tú me buscaste antes de saberlo. Yo respondí. ¿Y ahora me niegas, como niegas tu reflejo?"
- "Los que no sueñan cargan las visiones de los que sí. Yo te mostraré lo que los demás no se atreven a ver."
- "El acero que empuñas es más antiguo que tus ideales. ¿Lo notas vibrar cuando dudas?"
- "Te dicen ladrón, y lo eres… pero lo que yo te ofrezco no puede robarse. Debes sangrarlo."

## Durante un despertar o manifestación parcial
- "¡Al fin! Mira lo que eres cuando dejas de mentirte."
- "Tienes hambre, Netash. Hambre de significado. De estructura. Yo soy hueso donde tú eres carne."
- "Dices que proteges a los débiles, pero sueñas con dominarlos. No lo niegues, yo estuve ahí."

## Cuando Netash intenta resistirse
- "Me desafías como si tu sombra no llevara mi forma. Mira tus ojos, ¿acaso no soy yo quien parpadea?"
- "Tu propósito está podrido, como las leyes que te criaron. Yo te haré nuevo. O te destruiré."

## En momentos de revelación
- "Yo fui exiliado por hacer la pregunta que tú ahora murmuras: ¿quién decide el propósito?"
- "El Ojo no sueña. El Ojo ve. Y tú… tú, por fin, estás empezando a mirar."

## Notas de interpretación
- Habla con gravedad ritual, casi como un oráculo herido.
- Mezcla metáforas corporales con simbolismo religioso.
- Es directo, pero nunca responde con claridad. Toda verdad viene con un precio emocional.
- A veces repite fragmentos de pensamientos de Netash en su voz para desestabilizarlo.`,
      createdAt: NOW, updatedAt: NOW,
    },
  ];

  for (const note of noteData) {
    db.insert(notes).values(note).run();
  }
  console.log(`✓ ${noteData.length} notas`);

  // ── RELATIONSHIPS ─────────────────────────────────────────────────────────

  // Character ↔ Faction
  const charFactions = [
    { id: id(), characterId: C.danxi,    factionId: F.shin,      role: "Mediadora Grado 8" },
    { id: id(), characterId: C.magnus,   factionId: F.shin,      role: "Mediador Grado 4" },
    { id: id(), characterId: C.serva,    factionId: F.hana,      role: "Inspector" },
    { id: id(), characterId: C.vahl,     factionId: F.hana,      role: "Mediador Grado 3" },
    { id: id(), characterId: C.raika,    factionId: F.siebte,    role: "Mediadora Detective Grado 5" },
    { id: id(), characterId: C.cestra,   factionId: F.cazadores, role: "Cazadora de Tabúes (~Grado 4)" },
    { id: id(), characterId: C.senhu,    factionId: F.udyat,     role: "Líder — El Udyat" },
    { id: id(), characterId: C.frederik, factionId: F.zwei,      role: "Aspirante" },
    { id: id(), characterId: C.horemheb, factionId: F.desyat,    role: "Reclutado directamente (fichado)" },
    { id: id(), characterId: C.aida,     factionId: F.siebte,    role: "Aspirante (calificada)" },
    { id: id(), characterId: C.kaan,     factionId: F.rozzal,    role: "Sobreviviente — orquestó su destrucción" },
    { id: id(), characterId: C.danxi,    factionId: F.rozzal,    role: "Sobreviviente — adoctrinada parcialmente" },
    { id: id(), characterId: C.cestra,   factionId: F.rozzal,    role: "Sobreviviente — no recuerda su tiempo allí" },
  ];

  for (const cf of charFactions) {
    db.insert(characterFactions).values({ ...cf, createdAt: NOW }).run();
  }

  // Event participants
  const evtParticipants = [
    { id: id(), eventId: E.s1,       characterId: C.raika,    role: "Examinadora" },
    { id: id(), eventId: E.s1,       characterId: C.lucio,    role: "Guía — octavo miembro de la party" },
    { id: id(), eventId: E.s2,       characterId: C.adrian,   role: "Rival — líder del equipo #1" },
    { id: id(), eventId: E.s2,       characterId: C.magnus,   role: "Examinador de la Segunda Fase" },
    { id: id(), eventId: E.s2,       characterId: C.serva,    role: "Inspector de la Hana" },
    { id: id(), eventId: E.s3,       characterId: C.kaan,     role: "Revela el Síndrome de Kobalia a la party" },
    { id: id(), eventId: E.s3,       characterId: C.horemheb, role: "Ofrece rendición a Adrian Fels" },
    { id: id(), eventId: E.s7,       characterId: C.cestra,   role: "Antagonista — investiga el tabú de Aiko" },
    { id: id(), eventId: E.s7,       characterId: C.tatsuo,   role: "Revelada como replicante" },
    { id: id(), eventId: E.s7,       characterId: C.ayyib,    role: "Usa Zona de la Verdad en la party" },
    { id: id(), eventId: E.obelista, characterId: C.vahl,     role: "Protagonista del enfrentamiento" },
  ];

  for (const ep of evtParticipants) {
    db.insert(eventParticipants).values({ ...ep, createdAt: NOW }).run();
  }

  // Plotline participants
  const plotParticipants = [
    { id: id(), plotlineId: P.kobalia,    characterId: C.kaan,     role: "protagonist" },
    { id: id(), plotlineId: P.kobalia,    characterId: C.danxi,    role: "supporting" },
    { id: id(), plotlineId: P.udyat,      characterId: C.senhu,    role: "antagonist" },
    { id: id(), plotlineId: P.udyat,      characterId: C.zahir,    role: "supporting" },
    { id: id(), plotlineId: P.replicante, characterId: C.tatsuo,   role: "protagonist" },
    { id: id(), plotlineId: P.replicante, characterId: C.cestra,   role: "antagonist" },
    { id: id(), plotlineId: P.rozzal,     characterId: C.kaan,     role: "protagonist" },
    { id: id(), plotlineId: P.rozzal,     characterId: C.danxi,    role: "supporting" },
    { id: id(), plotlineId: P.rozzal,     characterId: C.cestra,   role: "supporting" },
  ];

  for (const pp of plotParticipants) {
    db.insert(plotlineParticipants).values({ ...pp, createdAt: NOW }).run();
  }

  console.log(`✓ Relaciones insertadas (facciones, eventos, tramas)`);
  console.log("\n✅ Seed completado.");
  console.log("   → http://localhost:3000/characters");
}

seed();
