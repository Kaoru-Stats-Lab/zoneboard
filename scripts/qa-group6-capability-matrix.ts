/**
 * Group 6 — Directory capability matrix (no UA strings).
 * Run: npx --yes tsx scripts/qa-group6-capability-matrix.ts
 */
import {
  canShowDirectoryPicker,
  isDirectoryModeAvailable,
  isSecureContextOk,
} from "../src/lib/fileSystemAccess";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

// Node: insecure / no picker → Directory mode off; File mode conceptually remains.
assert(isSecureContextOk() === false || typeof window === "undefined", "node context");
assert(canShowDirectoryPicker() === false, "no picker in node");
assert(isDirectoryModeAvailable() === false, "directory unavailable in node");

console.log("capability matrix (Node stand-in for FF/Safari without API): Directory OFF → File mode only");
console.log("qa-group6-capability-matrix: OK");
