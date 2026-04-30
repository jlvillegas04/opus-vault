import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, MapPin, Calendar, BookOpen, Swords, Scroll, MessageSquare } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { characters, factions, locations, events, plotlines, items, notes } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

function countRows(table: any): number {
  return db.select({ n: sql<number>`count(*)` }).from(table).get()?.n ?? 0;
}

export default function DashboardPage() {
  const entityCards = [
    { title: "Characters", description: "NPCs and PCs in your campaign",       icon: Users,    href: "/characters", count: countRows(characters) },
    { title: "Factions",   description: "Organizations, guilds, and kingdoms",  icon: Shield,   href: "/factions",   count: countRows(factions) },
    { title: "Locations",  description: "Cities, dungeons, and regions",        icon: MapPin,   href: "/locations",  count: countRows(locations) },
    { title: "Events",     description: "Session timeline and history",          icon: Calendar, href: "/events",     count: countRows(events) },
    { title: "Plotlines",  description: "Active and resolved story arcs",       icon: BookOpen, href: "/plotlines",  count: countRows(plotlines) },
    { title: "Items",      description: "Magic items and artifacts",            icon: Swords,   href: "/items",      count: countRows(items) },
    { title: "Notes",      description: "Campaign notes and documents",         icon: Scroll,   href: "/notes",      count: countRows(notes) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to Opus Vault</h1>
        <p className="text-muted-foreground mt-2">
          Your AI-powered campaign management system. Start by adding characters, locations,
          and other entities to build your world.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {entityCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.count}</div>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle>Lorekeeper AI</CardTitle>
          </div>
          <CardDescription>
            Once you&apos;ve added content to your vault, the Lorekeeper can help you:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Answer questions about your campaign world</li>
            <li>Suggest plotlines based on character goals and faction tensions</li>
            <li>Find connections between entities you might have missed</li>
            <li>Generate &quot;what if&quot; scenarios for your next session</li>
            <li>Prepare session summaries with relevant information</li>
          </ul>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 mt-4 text-sm text-primary hover:underline"
          >
            <MessageSquare className="h-4 w-4" />
            Open Lorekeeper Chat
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
