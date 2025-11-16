import type { SavedSearch } from "../lib/savedSearches";
import type {
  AppState as SerializedBuilderState,
  Bucket,
  Operator,
  Term,
  TermColorKey,
} from "../lib/types";

const EXAMPLE_DATE = "2025-01-01T00:00:00.000Z";

const TERM_COLORS: TermColorKey[] = [
  "lavender",
  "blue",
  "mint",
  "cyan",
  "teal",
  "yellow",
  "orange",
  "red",
  "pink",
  "violet",
];

let termCounter = 0;
let bucketCounter = 0;

const createTerm = (value: string): Term => {
  const color = TERM_COLORS[termCounter % TERM_COLORS.length];
  const term: Term = {
    id: `example-term-${termCounter++}`,
    value,
    colorKey: color,
  };
  return term;
};

const createBucket = (
  name: string,
  terms: string[],
  operatorAfter: Operator = "AND"
): Bucket => ({
  id: `example-bucket-${bucketCounter++}`,
  name,
  terms: terms.map(createTerm),
  isEnabled: true,
  operatorAfter,
});

const createState = (groups: Array<{ name: string; terms: string[] }>): SerializedBuilderState => ({
  buckets: groups.map((group, index) =>
    createBucket(
      group.name,
      group.terms,
      index === groups.length - 1 ? "AND" : "AND"
    )
  ),
  outputMode: "pretty",
});

export const EXAMPLE_SAVED_SEARCHES: SavedSearch[] = [
  {
    id: "1f4f5f76-3f41-4cf0-bc2c-2b8c3289f001",
    name: "Senior Frontend Engineer (Example)",
    shortDescription: "Senior frontend engineer for SaaS products (React + TypeScript, complex UI).",
    createdAt: EXAMPLE_DATE,
    updatedAt: EXAMPLE_DATE,
    lastUsedAt: EXAMPLE_DATE,
    state: createState([
      {
        name: "Titles",
        terms: [
          "frontend engineer",
          "front end engineer",
          "senior frontend developer",
          "react engineer",
        ],
      },
      {
        name: "Skills",
        terms: ["React", "TypeScript", "JavaScript", "component libraries"],
      },
      {
        name: "Industry / Domain",
        terms: ["SaaS", "B2B software", "cloud platform"],
      },
      {
        name: "Exclusions",
        terms: ["intern", "student", "bootcamp"],
      },
    ]),
    queryString:
      '("frontend engineer" OR "front end engineer" OR "senior frontend developer" OR "react engineer") AND (React OR TypeScript OR JavaScript OR "component libraries") AND (SaaS OR "B2B software" OR "cloud platform") NOT (intern OR student OR bootcamp)',
  },
  {
    id: "c7e34e2b-a8f7-4483-8cd5-5f53d8acb18d",
    name: "Senior Backend Engineer – Distributed Systems (Example)",
    shortDescription:
      "Backend engineer for distributed systems (Go/Java, Kafka, cloud).",
    createdAt: EXAMPLE_DATE,
    updatedAt: EXAMPLE_DATE,
    lastUsedAt: EXAMPLE_DATE,
    state: createState([
      {
        name: "Titles",
        terms: [
          "backend engineer",
          "backend developer",
          "software engineer",
          "distributed systems engineer",
        ],
      },
      {
        name: "Skills",
        terms: ["Golang", "Go language", "Java", "Kafka", "Redis"],
      },
      {
        name: "Cloud",
        terms: ["AWS", "GCP", "cloud infrastructure"],
      },
      {
        name: "Exclusions",
        terms: ["PHP", "Wordpress"],
      },
    ]),
    queryString:
      '("backend engineer" OR "backend developer" OR "software engineer" OR "distributed systems engineer") AND (Golang OR "Go language" OR Java OR Kafka OR Redis) AND (AWS OR GCP OR "cloud infrastructure") NOT (PHP OR Wordpress)',
  },
  {
    id: "9396f1d3-830d-4d3a-9603-b15f641a4e6f",
    name: "Enterprise Account Executive (Example)",
    shortDescription: "Enterprise SaaS AE closing mid-market and enterprise deals.",
    createdAt: EXAMPLE_DATE,
    updatedAt: EXAMPLE_DATE,
    lastUsedAt: EXAMPLE_DATE,
    state: createState([
      {
        name: "Titles",
        terms: [
          "account executive",
          "enterprise account executive",
          "senior account executive",
        ],
      },
      {
        name: "Sales Skills",
        terms: ["SaaS", "B2B sales", "enterprise sales", "solution selling"],
      },
      {
        name: "Targets",
        terms: ["mid market", "enterprise", "strategic accounts"],
      },
      {
        name: "Exclusions",
        terms: ["SDR", "BDR", "customer success"],
      },
    ]),
    queryString:
      '("account executive" OR "enterprise account executive" OR "senior account executive") AND (SaaS OR "B2B sales" OR "enterprise sales" OR "solution selling") AND ("mid market" OR enterprise OR "strategic accounts") NOT ("SDR" OR "BDR" OR "customer success")',
  },
  {
    id: "3c7ca8ea-3cc7-4793-bc55-9b140f9db8c4",
    name: "Sales Development Representative (Example)",
    shortDescription:
      "Outbound SDR / BDR for SaaS, focused on prospecting and cold outreach.",
    createdAt: EXAMPLE_DATE,
    updatedAt: EXAMPLE_DATE,
    lastUsedAt: EXAMPLE_DATE,
    state: createState([
      {
        name: "Titles",
        terms: [
          "sales development representative",
          "SDR",
          "business development representative",
          "BDR",
        ],
      },
      {
        name: "Skills",
        terms: ["outbound", "prospecting", "cold outreach", "lead generation"],
      },
      {
        name: "Industry",
        terms: ["SaaS", "tech", "startup"],
      },
      {
        name: "Exclusions",
        terms: ["customer support", "account manager"],
      },
    ]),
    queryString:
      '("sales development representative" OR SDR OR "business development representative" OR BDR) AND (outbound OR prospecting OR "cold outreach" OR "lead generation") AND (SaaS OR tech OR startup) NOT ("customer support" OR "account manager")',
  },
  {
    id: "f7d6a5aa-0d8c-4214-9e64-3a4732c38fa6",
    name: "Registered Nurse – Emergency Department (Example)",
    shortDescription:
      "Emergency department RN with triage, trauma, and critical care experience.",
    createdAt: EXAMPLE_DATE,
    updatedAt: EXAMPLE_DATE,
    lastUsedAt: EXAMPLE_DATE,
    state: createState([
      {
        name: "Titles",
        terms: [
          "registered nurse",
          "RN",
          "emergency department nurse",
          "ER nurse",
        ],
      },
      {
        name: "Skills",
        terms: ["triage", "patient assessment", "emergency care", "trauma"],
      },
      {
        name: "Certifications",
        terms: ["BLS", "ACLS", "PALS"],
      },
    ]),
    queryString:
      '("registered nurse" OR RN OR "emergency department nurse" OR "ER nurse") AND (triage OR "patient assessment" OR "emergency care" OR trauma) AND (BLS OR ACLS OR PALS)',
  },
  {
    id: "1e32b948-e9a8-44b7-9b42-8b208365f11b",
    name: "Senior Accountant – Corporate / GL (Example)",
    shortDescription:
      "Senior corporate accountant with GL, GAAP, and month-end close experience.",
    createdAt: EXAMPLE_DATE,
    updatedAt: EXAMPLE_DATE,
    lastUsedAt: EXAMPLE_DATE,
    state: createState([
      {
        name: "Titles",
        terms: ["accountant", "senior accountant", "general ledger accountant"],
      },
      {
        name: "Skills",
        terms: ["general ledger", "financial reporting", "month end close", "GAAP"],
      },
      {
        name: "Tools",
        terms: ["NetSuite", "QuickBooks", "SAP"],
      },
    ]),
    queryString:
      '(accountant OR "senior accountant" OR "general ledger accountant") AND ("general ledger" OR "financial reporting" OR "month end close" OR GAAP) AND (NetSuite OR QuickBooks OR SAP)',
  },
];
