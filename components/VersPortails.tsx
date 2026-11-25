"use client";
// À chaque nouvelle ouverture de l'app (téléphone ou ordinateur), on passe d'abord par le choix de l'espace.
import { useEffect } from "react";

export default function VersPortails() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("kw-portail") !== "1") window.location.replace("/portails");
    } catch {}
  }, []);
  return null;
}
