import { sqliteTable, text, integer, AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Characters - NPCs and PCs
export const characters = sqliteTable("characters", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title"), // "The Betrayer", "High Priestess", etc.
  description: text("description"),
  backstory: text("backstory"),
  status: text("status", { enum: ["alive", "dead", "missing", "unknown"] }).default("alive"),
  imageUrl: text("image_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Factions - Organizations, guilds, kingdoms
export const factions = sqliteTable("factions", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  goals: text("goals"),
  alignment: text("alignment"), // "Lawful Good", "Chaotic Evil", etc.
  imageUrl: text("image_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Locations - Cities, dungeons, regions, planes
export const locations = sqliteTable("locations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  locationType: text("location_type", {
    enum: ["world", "region", "city", "district", "building", "dungeon", "wilderness", "plane", "other"]
  }).default("other"),
  parentLocationId: text("parent_location_id").references((): AnySQLiteColumn => locations.id),
  imageUrl: text("image_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Events - Session timeline, historical events
export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  sessionNumber: integer("session_number"),
  eventDate: text("event_date"), // In-world date (flexible format)
  realDate: integer("real_date", { mode: "timestamp" }), // Real-world session date
  consequences: text("consequences"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Plotlines - Story arcs, quests
export const plotlines = sqliteTable("plotlines", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", {
    enum: ["active", "resolved", "dormant", "abandoned"]
  }).default("active"),
  hooks: text("hooks"), // Potential story hooks
  complications: text("complications"),
  potentialResolutions: text("potential_resolutions"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Items - Magic items, artifacts, important objects
export const items = sqliteTable("items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  properties: text("properties"), // Magical properties, stats
  rarity: text("rarity", {
    enum: ["common", "uncommon", "rare", "very_rare", "legendary", "artifact", "unique"]
  }),
  currentOwnerId: text("current_owner_id").references(() => characters.id),
  currentLocationId: text("current_location_id").references(() => locations.id),
  history: text("history"),
  imageUrl: text("image_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Notes - Raw markdown documents
export const notes = sqliteTable("notes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  sourcePath: text("source_path"), // Original file path if imported
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ==================== RELATIONSHIP TABLES ====================

// Character to Faction membership
export const characterFactions = sqliteTable("character_factions", {
  id: text("id").primaryKey(),
  characterId: text("character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
  factionId: text("faction_id").notNull().references(() => factions.id, { onDelete: "cascade" }),
  role: text("role"), // "Leader", "Member", "Former Member"
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Character to Character relationships
export const characterRelationships = sqliteTable("character_relationships", {
  id: text("id").primaryKey(),
  characterId: text("character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
  relatedCharacterId: text("related_character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
  relationshipType: text("relationship_type"), // "rivals with", "parent of", "allied with"
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Faction to Faction relationships
export const factionRelationships = sqliteTable("faction_relationships", {
  id: text("id").primaryKey(),
  factionId: text("faction_id").notNull().references(() => factions.id, { onDelete: "cascade" }),
  relatedFactionId: text("related_faction_id").notNull().references(() => factions.id, { onDelete: "cascade" }),
  relationshipType: text("relationship_type", {
    enum: ["allied", "hostile", "neutral", "vassal", "trade_partner", "rival"]
  }),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Event participants (characters and factions involved in events)
export const eventParticipants = sqliteTable("event_participants", {
  id: text("id").primaryKey(),
  eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  characterId: text("character_id").references(() => characters.id, { onDelete: "cascade" }),
  factionId: text("faction_id").references(() => factions.id, { onDelete: "cascade" }),
  role: text("role"), // What role did they play in this event
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Event to Location relationship
export const eventLocations = sqliteTable("event_locations", {
  id: text("id").primaryKey(),
  eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  locationId: text("location_id").notNull().references(() => locations.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Plotline participants (characters and factions involved in plotlines)
export const plotlineParticipants = sqliteTable("plotline_participants", {
  id: text("id").primaryKey(),
  plotlineId: text("plotline_id").notNull().references(() => plotlines.id, { onDelete: "cascade" }),
  characterId: text("character_id").references(() => characters.id, { onDelete: "cascade" }),
  factionId: text("faction_id").references(() => factions.id, { onDelete: "cascade" }),
  role: text("role"), // "protagonist", "antagonist", "supporting"
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Plotline to Event links
export const plotlineEvents = sqliteTable("plotline_events", {
  id: text("id").primaryKey(),
  plotlineId: text("plotline_id").notNull().references(() => plotlines.id, { onDelete: "cascade" }),
  eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  significance: text("significance"), // Why this event matters to the plotline
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Character to Location (current/home location)
export const characterLocations = sqliteTable("character_locations", {
  id: text("id").primaryKey(),
  characterId: text("character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
  locationId: text("location_id").notNull().references(() => locations.id, { onDelete: "cascade" }),
  locationType: text("location_type", { enum: ["current", "home", "birthplace", "headquarters"] }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// ==================== RELATIONS ====================

export const charactersRelations = relations(characters, ({ many }) => ({
  factions: many(characterFactions),
  relationships: many(characterRelationships, { relationName: "character" }),
  relatedTo: many(characterRelationships, { relationName: "relatedCharacter" }),
  items: many(items),
  eventParticipations: many(eventParticipants),
  plotlineParticipations: many(plotlineParticipants),
  locations: many(characterLocations),
}));

export const factionsRelations = relations(factions, ({ many }) => ({
  members: many(characterFactions),
  relationships: many(factionRelationships, { relationName: "faction" }),
  relatedTo: many(factionRelationships, { relationName: "relatedFaction" }),
  eventParticipations: many(eventParticipants),
  plotlineParticipations: many(plotlineParticipants),
}));

export const locationsRelations = relations(locations, ({ one, many }) => ({
  parentLocation: one(locations, {
    fields: [locations.parentLocationId],
    references: [locations.id],
    relationName: "parentChild",
  }),
  childLocations: many(locations, { relationName: "parentChild" }),
  items: many(items),
  events: many(eventLocations),
  characters: many(characterLocations),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  participants: many(eventParticipants),
  locations: many(eventLocations),
  plotlines: many(plotlineEvents),
}));

export const plotlinesRelations = relations(plotlines, ({ many }) => ({
  participants: many(plotlineParticipants),
  events: many(plotlineEvents),
}));

export const itemsRelations = relations(items, ({ one }) => ({
  currentOwner: one(characters, {
    fields: [items.currentOwnerId],
    references: [characters.id],
  }),
  currentLocation: one(locations, {
    fields: [items.currentLocationId],
    references: [locations.id],
  }),
}));

// Relationship table relations
export const characterFactionsRelations = relations(characterFactions, ({ one }) => ({
  character: one(characters, {
    fields: [characterFactions.characterId],
    references: [characters.id],
  }),
  faction: one(factions, {
    fields: [characterFactions.factionId],
    references: [factions.id],
  }),
}));

export const characterRelationshipsRelations = relations(characterRelationships, ({ one }) => ({
  character: one(characters, {
    fields: [characterRelationships.characterId],
    references: [characters.id],
    relationName: "character",
  }),
  relatedCharacter: one(characters, {
    fields: [characterRelationships.relatedCharacterId],
    references: [characters.id],
    relationName: "relatedCharacter",
  }),
}));

export const factionRelationshipsRelations = relations(factionRelationships, ({ one }) => ({
  faction: one(factions, {
    fields: [factionRelationships.factionId],
    references: [factions.id],
    relationName: "faction",
  }),
  relatedFaction: one(factions, {
    fields: [factionRelationships.relatedFactionId],
    references: [factions.id],
    relationName: "relatedFaction",
  }),
}));

export const eventParticipantsRelations = relations(eventParticipants, ({ one }) => ({
  event: one(events, {
    fields: [eventParticipants.eventId],
    references: [events.id],
  }),
  character: one(characters, {
    fields: [eventParticipants.characterId],
    references: [characters.id],
  }),
  faction: one(factions, {
    fields: [eventParticipants.factionId],
    references: [factions.id],
  }),
}));

export const eventLocationsRelations = relations(eventLocations, ({ one }) => ({
  event: one(events, {
    fields: [eventLocations.eventId],
    references: [events.id],
  }),
  location: one(locations, {
    fields: [eventLocations.locationId],
    references: [locations.id],
  }),
}));

export const plotlineParticipantsRelations = relations(plotlineParticipants, ({ one }) => ({
  plotline: one(plotlines, {
    fields: [plotlineParticipants.plotlineId],
    references: [plotlines.id],
  }),
  character: one(characters, {
    fields: [plotlineParticipants.characterId],
    references: [characters.id],
  }),
  faction: one(factions, {
    fields: [plotlineParticipants.factionId],
    references: [factions.id],
  }),
}));

export const plotlineEventsRelations = relations(plotlineEvents, ({ one }) => ({
  plotline: one(plotlines, {
    fields: [plotlineEvents.plotlineId],
    references: [plotlines.id],
  }),
  event: one(events, {
    fields: [plotlineEvents.eventId],
    references: [events.id],
  }),
}));

export const characterLocationsRelations = relations(characterLocations, ({ one }) => ({
  character: one(characters, {
    fields: [characterLocations.characterId],
    references: [characters.id],
  }),
  location: one(locations, {
    fields: [characterLocations.locationId],
    references: [locations.id],
  }),
}));

// Type exports for use in the application
export type Character = typeof characters.$inferSelect;
export type NewCharacter = typeof characters.$inferInsert;
export type Faction = typeof factions.$inferSelect;
export type NewFaction = typeof factions.$inferInsert;
export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Plotline = typeof plotlines.$inferSelect;
export type NewPlotline = typeof plotlines.$inferInsert;
export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
