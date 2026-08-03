#!/usr/bin/env python3
"""Parse วุฒิป.เอก CSV + faculty.sql → degree_seed.sql"""

from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path

CSV_PATH = Path(
    r"c:\Users\DINA\OneDrive\Desktop\Excel Project\ข้อมูลอาจารย์\วุฒิป.เอก (csv).csv"
)
FACULTY_SQL = Path(r"c:\Users\DINA\Downloads\faculty.sql")
OUT_SQL = Path(__file__).with_name("degree_seed.sql")
REPORT_JSON = Path(__file__).with_name("degree_seed_report.json")

# CSV spelling → faculty spelling
NAME_ALIASES: dict[tuple[str, str], tuple[str, str]] = {
    ("สิริณัฐ", "สินวรรณกุล"): ("สิรินัฐ", "สินวรรณกุล"),
}

DEGREE_BLOCKS = [
    # (level, field_group, col_start, col_end exclusive)
    ("Bachelor", None, 3, 7),
    ("Master", "nursing", 7, 11),
    ("Master", "other", 11, 15),
    ("Doctoral", "nursing", 15, 19),
    ("Doctoral", "other", 19, 23),
]


def norm(s: object) -> str:
    if s is None:
        return ""
    t = str(s).strip().replace(" ", "").replace("\u00a0", "")
    return t.replace("เเ", "แ")


def cell(v: object) -> str | None:
    if v is None:
        return None
    t = str(v).strip()
    if t in ("", "-"):
        return None
    return t


def sql_str(v: str | None) -> str:
    if v is None:
        return "NULL"
    return "'" + v.replace("\\", "\\\\").replace("'", "''") + "'"


def sql_int(v: str | None) -> str:
    if v is None:
        return "NULL"
    digits = re.sub(r"[^\d]", "", v)
    if not digits:
        return "NULL"
    return digits


def parse_faculty(path: Path) -> list[dict]:
    text = path.read_bytes().decode("utf-8", errors="replace")
    pat = re.compile(
        r"\((\d+),\s*(\d+),\s*'((?:\\'|[^'])*)',\s*'((?:\\'|[^'])*)',\s*'((?:\\'|[^'])*)',\s*'((?:\\'|[^'])*)',\s*'((?:\\'|[^'])*)'"
    )
    rows = []
    for m in pat.finditer(text):
        rows.append(
            {
                "id": int(m.group(1)),
                "faculty_id": int(m.group(2)),
                "title": m.group(3),
                "first_name_th": m.group(4),
                "last_name_th": m.group(5),
            }
        )
    return rows


def load_people(csv_path: Path) -> list[dict]:
    text = csv_path.read_bytes().decode("utf-8-sig")
    rows = list(csv.reader(text.splitlines()))
    people: list[dict] = []
    cur = None
    for i, r in enumerate(rows[3:], start=4):
        first = (r[1] if len(r) > 1 else "") or ""
        last = (r[2] if len(r) > 2 else "") or ""
        title = (r[0] if len(r) > 0 else "") or ""
        first, last, title = first.strip(), last.strip(), title.strip()
        vals = list(r) + [""] * max(0, 23 - len(r))
        if first or last:
            cur = {
                "source_row": i,
                "title": title,
                "first": first,
                "last": last,
                "raw_rows": [vals],
            }
            people.append(cur)
        elif cur is not None:
            chunk = vals[3:23]
            if any(cell(v) for v in chunk):
                cur["raw_rows"].append(vals)
    return people


def extract_degrees(person: dict) -> list[dict]:
    out = []
    for level, field_group, a, b in DEGREE_BLOCKS:
        for vals in person["raw_rows"]:
            prog, inst, major, year = [cell(x) for x in vals[a:b]]
            if not any((prog, inst, major, year)):
                continue
            out.append(
                {
                    "degree_level": level,
                    "field_group": field_group,
                    "degree_name_th": prog,
                    "institution_name": inst,
                    "major": major,
                    "graduation_year": year,
                    "source_row": person["source_row"],
                }
            )
    return out


def main() -> int:
    if not CSV_PATH.is_file():
        print(f"CSV not found: {CSV_PATH}", file=sys.stderr)
        return 1
    if not FACULTY_SQL.is_file():
        print(f"faculty.sql not found: {FACULTY_SQL}", file=sys.stderr)
        return 1

    faculty = parse_faculty(FACULTY_SQL)
    by_name: dict[tuple[str, str], list[dict]] = {}
    for f in faculty:
        key = (norm(f["first_name_th"]), norm(f["last_name_th"]))
        by_name.setdefault(key, []).append(f)

    people = load_people(CSV_PATH)
    inserts: list[str] = []
    matched_people = 0
    unmatched_people: list[dict] = []
    alias_used: list[dict] = []
    level_counts: dict[str, int] = {}
    field_group_counts: dict[str, int] = {}
    doctoral_by_group: dict[str, int] = {"nursing": 0, "other": 0}
    curriculum_faculty_ids: set[int] = set()

    for person in people:
        key = (norm(person["first"]), norm(person["last"]))
        alias_key = NAME_ALIASES.get(key)
        lookup = alias_key or key
        hits = by_name.get(lookup, [])
        faculty_id = hits[0]["faculty_id"] if hits else None
        if hits:
            matched_people += 1
            if alias_key:
                alias_used.append(
                    {
                        "csv": f"{person['first']} {person['last']}",
                        "faculty_id": faculty_id,
                        "mapped_to": f"{hits[0]['first_name_th']} {hits[0]['last_name_th']}",
                    }
                )
        else:
            unmatched_people.append(
                {
                    "row": person["source_row"],
                    "first": person["first"],
                    "last": person["last"],
                }
            )

        for deg in extract_degrees(person):
            level_counts[deg["degree_level"]] = level_counts.get(deg["degree_level"], 0) + 1
            fg_key = deg["field_group"] or "null"
            field_group_counts[fg_key] = field_group_counts.get(fg_key, 0) + 1
            if deg["degree_level"] == "Doctoral" and deg["field_group"] in doctoral_by_group:
                doctoral_by_group[deg["field_group"]] += 1
                if deg["field_group"] == "nursing" and faculty_id is not None:
                    curriculum_faculty_ids.add(faculty_id)
            fid = "NULL" if faculty_id is None else str(faculty_id)
            inserts.append(
                "("
                + ", ".join(
                    [
                        fid,
                        sql_str(deg["degree_level"]),
                        sql_str(deg["field_group"]),
                        sql_str(deg["degree_name_th"]),
                        "NULL",  # degree_name_en
                        "NULL",  # degree_abbr_th
                        "NULL",  # degree_abbr_en
                        sql_str(deg["major"]),
                        sql_str(deg["institution_name"]),
                        sql_int(deg["graduation_year"]),
                        "NULL",  # start_year
                        "NULL",  # expected_grad_year
                        "NULL",  # file_path
                    ]
                )
                + ")"
            )

    lines = [
        "-- Generated by generate_degree_seed.py",
        "-- Source: วุฒิป.เอก (csv).csv matched to faculty.sql",
        "-- Run AFTER degree_alter_nullable.sql (faculty_id NULL + field_group)",
        "-- Curriculum faculty: Doctoral + field_group=nursing + faculty_id NOT NULL",
        "",
        "SET NAMES utf8mb4;",
        "START TRANSACTION;",
        "",
        "-- Replace all degree rows with CSV import (table expected empty or disposable).",
        "DELETE FROM `degree`;",
        "ALTER TABLE `degree` AUTO_INCREMENT = 1;",
        "",
        "INSERT INTO `degree` (",
        "  `faculty_id`,",
        "  `degree_level`,",
        "  `field_group`,",
        "  `degree_name_th`,",
        "  `degree_name_en`,",
        "  `degree_abbr_th`,",
        "  `degree_abbr_en`,",
        "  `major`,",
        "  `institution_name`,",
        "  `graduation_year`,",
        "  `start_year`,",
        "  `expected_grad_year`,",
        "  `file_path`",
        ") VALUES",
    ]

    if inserts:
        for i, row in enumerate(inserts):
            sep = "," if i < len(inserts) - 1 else ";"
            lines.append(f"  {row}{sep}")
    else:
        lines.append("  -- no rows")
        lines.append(";")

    lines.extend(["", "COMMIT;", ""])
    OUT_SQL.write_text("\n".join(lines), encoding="utf-8")

    report = {
        "csv_people": len(people),
        "matched_people": matched_people,
        "unmatched_people": unmatched_people,
        "alias_used": alias_used,
        "degree_rows": len(inserts),
        "by_level": level_counts,
        "by_field_group": field_group_counts,
        "doctoral_by_group": doctoral_by_group,
        "curriculum_faculty_ids": sorted(curriculum_faculty_ids),
        "curriculum_faculty_count": len(curriculum_faculty_ids),
        "faculty_total": len(faculty),
        "out_sql": str(OUT_SQL),
    }
    REPORT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
