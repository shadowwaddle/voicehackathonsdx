"use client";
import { useCallback } from "react";
import type { SessionReport } from "@/types/contract";
import { useLocalStorage } from "./useLocalStorage";

const EMPTY: SessionReport[] = [];

/** Session reports (numbers + deletion receipts only), oldest first, on this device. */
export function useReports() {
  const [reports, save, ready] = useLocalStorage<SessionReport[]>("birbal.reports", EMPTY);
  const addReport = useCallback(
    (r: SessionReport) => save([...reports.filter((x) => x.id !== r.id), r].slice(-200)),
    [save, reports],
  );
  const replaceAll = useCallback((next: SessionReport[]) => save(next), [save]);
  const clearReports = useCallback(() => save([]), [save]);
  return { reports, addReport, replaceAll, clearReports, ready };
}
