import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { academicNow, getCurrentAcademicYear, syncAcademicClock } from "@/lib/academicYear";

export function useAcademicYear(): number {
  const [tick, refresh] = useState(0);
  const { dataUpdatedAt } = useQuery({
    queryKey: ["academic-calendar"],
    queryFn: async ({ signal }) => {
      const response = await api.get("/index.php?page=academic-calendar", { signal });
      if (response.data?.status !== "success") throw new Error("โหลดปฏิทินปีการศึกษาไม่สำเร็จ");
      syncAcademicClock(response.data.data.serverNow);
      return response.data.data as { serverNow: string; academicYear: number };
    },
    staleTime: 60_000,
    refetchOnWindowFocus: "always",
    refetchInterval: 60_000,
    retry: false,
  });
  const year = getCurrentAcademicYear();
  useEffect(() => {
    const rollover = Date.parse(`${year - 543 + 1}-04-01T00:00:00+07:00`);
    // Wake at the boundary, with a daily maximum to avoid overflowing browser timers.
    const timer = window.setTimeout(() => refresh((value) => value + 1),
      Math.max(1, Math.min(86_400_000, rollover - academicNow().getTime())));
    return () => window.clearTimeout(timer);
  }, [year, dataUpdatedAt, tick]);
  return year;
}

/** A user-selected year stays selected across calendar refreshes and rollovers. */
export function useAcademicYearSelection() {
  const currentYear = useAcademicYear();
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  return { currentYear, academicYear: selectedYear ?? String(currentYear), setAcademicYear: setSelectedYear };
}
