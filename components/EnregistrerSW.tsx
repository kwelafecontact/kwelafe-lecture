"use client";
import { useEffect } from "react";

export default function EnregistrerSW() {
  useEffect(() => {
    // updateViaCache "none" : le navigateur vérifie toujours la dernière version de sw.js
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).catch(() => {});
  }, []);
  return null;
}
