export type ResearchYearMode = "calendar" | "academic";

export interface ResearchYearBoundary {
  month: number;
  day: number;
}

export interface ResearchCountPublication {
  publication_date: string;
  publication_type: string;
  funding_type: string;
  funding_amount: number;
  authors: Array<{ faculty_id: number; role: string }>;
}

export interface ResearchCounts {
  kpi: number;
  coAuthor: number;
  academic: number;
}

export interface ResearchFunding {
  internal: number;
  external: number;
}

const emptyCounts = (): ResearchCounts => ({ kpi: 0, coAuthor: 0, academic: 0 });

export function researchPublicationYear(dateValue: string, mode: ResearchYearMode, boundary: ResearchYearBoundary): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);
  if (!match) return 0;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return 0;
  if (mode === "calendar") return year + 543;
  return year + 543 - (month * 100 + day < boundary.month * 100 + boundary.day ? 1 : 0);
}

export function buildResearchYearIndex(
  publications: ResearchCountPublication[],
  mode: ResearchYearMode,
  boundary: ResearchYearBoundary,
) {
  const countsByYear = new Map<number, Map<number, ResearchCounts>>();
  const totalsByYear = new Map<number, ResearchCounts>();
  const fundingByYear = new Map<number, ResearchFunding>();

  for (const publication of publications) {
    const year = researchPublicationYear(publication.publication_date, mode, boundary);
    if (!year) continue;

    let facultyCounts = countsByYear.get(year);
    if (!facultyCounts) {
      facultyCounts = new Map();
      countsByYear.set(year, facultyCounts);
    }
    let totals = totalsByYear.get(year);
    if (!totals) {
      totals = emptyCounts();
      totalsByYear.set(year, totals);
    }
    let funding = fundingByYear.get(year);
    if (!funding) {
      funding = { internal: 0, external: 0 };
      fundingByYear.set(year, funding);
    }
    if (publication.funding_type === "internal") funding.internal += publication.funding_amount;
    if (publication.funding_type === "external") funding.external += publication.funding_amount;

    for (const author of publication.authors) {
      let counts = facultyCounts.get(author.faculty_id);
      if (!counts) {
        counts = emptyCounts();
        facultyCounts.set(author.faculty_id, counts);
      }
      const key = publication.publication_type === "academic" || publication.publication_type === "textbook"
        ? "academic"
        : author.role === "first_author" || author.role === "corresponding" ? "kpi" : "coAuthor";
      counts[key]++;
      totals[key]++;
    }
  }

  return { countsByYear, totalsByYear, fundingByYear };
}
