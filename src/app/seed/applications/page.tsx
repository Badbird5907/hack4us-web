"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type SeedResult = {
  profiles: number;
  applications: number;
  reviews: number;
  aiScores: number;
  flags: number;
};

type ClearResult = {
  profiles: number;
  applications: number;
  reviews: number;
  flags: number;
  comments: number;
};

export default function SeedApplicationsPage() {
  const [attendees, setAttendees] = useState(10);
  const [mentors, setMentors] = useState(10);
  const [volunteers, setVolunteers] = useState(10);

  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);
  const [clearResult, setClearResult] = useState<ClearResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const seedMutation = useMutation(api.fn.seed.seedApplications);
  const clearMutation = useMutation(api.fn.seed.clearSeedData);

  async function handleSeed() {
    setSeeding(true);
    setError(null);
    setResult(null);
    setClearResult(null);
    try {
      const res = await seedMutation({ attendees, mentors, volunteers });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSeeding(false);
    }
  }

  async function handleClear() {
    setClearing(true);
    setError(null);
    setResult(null);
    setClearResult(null);
    try {
      const res = await clearMutation({});
      setClearResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setClearing(false);
    }
  }

  const total = attendees + mentors + volunteers;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
        <AlertTitle className="text-amber-600">Development Tool</AlertTitle>
        <AlertDescription className="text-amber-600/80">
          This page seeds fake user profiles and applications into the database
          for testing. You must be logged in as an admin. Seed data uses a{" "}
          <code className="rounded bg-amber-500/20 px-1 text-xs">seed_</code>{" "}
          prefix and can be cleared without affecting real data.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-black tracking-tight uppercase">
            Seed Applications
          </CardTitle>
          <CardDescription>
            Configure how many profiles and submitted applications to create for
            each participant type.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="attendees"
                className="text-sm font-medium leading-none"
              >
                Attendees
              </label>
              <Input
                id="attendees"
                type="number"
                min={0}
                max={100}
                value={attendees}
                onChange={(e) => setAttendees(Number(e.target.value) || 0)}
                disabled={seeding}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="mentors"
                className="text-sm font-medium leading-none"
              >
                Mentors
              </label>
              <Input
                id="mentors"
                type="number"
                min={0}
                max={100}
                value={mentors}
                onChange={(e) => setMentors(Number(e.target.value) || 0)}
                disabled={seeding}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="volunteers"
                className="text-sm font-medium leading-none"
              >
                Volunteers
              </label>
              <Input
                id="volunteers"
                type="number"
                min={0}
                max={100}
                value={volunteers}
                onChange={(e) => setVolunteers(Number(e.target.value) || 0)}
                disabled={seeding}
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Total: {total} profiles + applications. ~{Math.round(total * 0.6)}{" "}
            will get AI scores, ~{Math.round(total * 0.4)} will get reviews, ~
            {Math.round(total * 0.1)} will get decisions.
          </p>
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button onClick={handleSeed} disabled={seeding || clearing || total === 0}>
            {seeding ? "Seeding..." : "Seed Database"}
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={seeding || clearing}
          >
            {clearing ? "Clearing..." : "Clear Seed Data"}
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Seed Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Profiles created</dt>
              <dd className="font-mono">{result.profiles}</dd>
              <dt className="text-muted-foreground">Applications created</dt>
              <dd className="font-mono">{result.applications}</dd>
              <dt className="text-muted-foreground">AI scores generated</dt>
              <dd className="font-mono">{result.aiScores}</dd>
              <dt className="text-muted-foreground">Reviews created</dt>
              <dd className="font-mono">{result.reviews}</dd>
              <dt className="text-muted-foreground">Flags created</dt>
              <dd className="font-mono">{result.flags}</dd>
            </dl>
          </CardContent>
        </Card>
      )}

      {clearResult && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Clear Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Profiles deleted</dt>
              <dd className="font-mono">{clearResult.profiles}</dd>
              <dt className="text-muted-foreground">Applications deleted</dt>
              <dd className="font-mono">{clearResult.applications}</dd>
              <dt className="text-muted-foreground">Reviews deleted</dt>
              <dd className="font-mono">{clearResult.reviews}</dd>
              <dt className="text-muted-foreground">Flags deleted</dt>
              <dd className="font-mono">{clearResult.flags}</dd>
              <dt className="text-muted-foreground">Comments deleted</dt>
              <dd className="font-mono">{clearResult.comments}</dd>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
