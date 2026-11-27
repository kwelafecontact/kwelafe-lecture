"use client";
import { useEffect } from "react";
import { appliquerReglages, lireReglages } from "@/lib/reglages";
export default function AppliquerReglages() {
  useEffect(() => { appliquerReglages(lireReglages()); }, []);
  return null;
}
