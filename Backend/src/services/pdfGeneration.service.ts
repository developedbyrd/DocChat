import axios from "axios";
import { randomUUID } from "node:crypto";
import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

export type PdfPlan = {
  title: string;
  sections: { heading: string; body: string }[];
};

export type PdfOverlayInstructions = {
  lines: string[];
  allPages: boolean;
};

/**
 * 1-based page numbers to copy, in order, deduped. Undefined = copy all pages.
 */
export type PdfPageSelection = number[] | undefined;

const GENERATED_DIR = path.join(process.cwd(), "uploads", "generated");

function ensureGeneratedDir() {
  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  }
}

export function wantsPdfGeneration(userContent: string): boolean {
  const t = userContent.toLowerCase();
  if (!/\bpdf(s)?\b/.test(t)) return false;

  // Likely viewing the existing file, not asking for a newly built PDF
  if (
    /\b(open|read|view|display|show|see)\s+(the\s+|this\s+|my\s+)?pdf\b/.test(
      t,
    ) &&
    !/\b(create|generate|make|new|export|build|another|second|different)\b/.test(
      t,
    )
  ) {
    return false;
  }

  const wantsNewFile =
    /\b(generate|create|make|export|build|produce|draft|prepare|compile)\s+(a\s+|an\s+|the\s+|my\s+|this\s+)?(\w+\s+){0,4}pdf\b/.test(
      t,
    ) ||
    /\b(generate|create|make|export|build)\s+(a\s+|an\s+|my\s+)?(new\s+)?pdf\b/.test(
      t,
    ) ||
    /\bnew\s+pdf\b/.test(t) ||
    /\b(give|send|get)\s+(me\s+)?(a\s+|an\s+)?pdf\b/.test(t) ||
    /\b(want|need)\s+(a\s+|an\s+|my\s+)?(new\s+)?pdf\b/.test(t) ||
    /\b(as|into|to)\s+(a\s+|an\s+)?pdf\b/.test(t) ||
    /\b(download|save)\b.*\bpdf\b|\bpdf\b.*\b(download|save)\b/.test(t) ||
    /\b(write|put|convert|turn)\b.*\bpdf\b/.test(t) ||
    /\bpdf\b.*\b(generate|create|make|export|build|with|for|from|that|version|only|just|include|add|based)\b/.test(
      t,
    ) ||
    /\b(in|into|to)\s+(a\s+|an\s+|the\s+|my\s+)?(new\s+)?pdf\b/.test(t);

  return wantsNewFile;
}

/**
 * User wants new PDF content produced from the document text (summary, rewrite, etc.),
 * not a byte-for-byte copy or page extract of the upload.
 */
export function wantsAiComposedPdf(userContent: string): boolean {
  const t = userContent.toLowerCase();
  if (/\bsummar(y|ize|ies|ization|isation)\b/.test(t)) return true;
  if (/\bsummarization\b/.test(t)) return true;
  if (/\bsummary\b/.test(t)) return true;
  if (/\btl;?dr\b/.test(t)) return true;
  if (/\babstract\b/.test(t)) return true;
  if (/\bsynopsis\b/.test(t)) return true;
  if (/\brewrit(e|ing|ten)\b/.test(t)) return true;
  if (/\bparaphrase\b/.test(t)) return true;
  if (/\bcondense\b/.test(t)) return true;
  if (/\bshorten\b/.test(t)) return true;
  if (/\bin\s+my\s+own\s+words\b/.test(t)) return true;
  if (/\b(key|main|important)\s+points?\b/.test(t)) return true;
  if (/\bbullet(s)?\s+points?\b/.test(t)) return true;
  if (/\bbullet(s)?\b/.test(t) && /\b(list|outline)\b/.test(t)) return true;
  if (/\bhighlights?\b/.test(t) && /\b(pdf|document|generate|create)\b/.test(t))
    return true;
  if (
    /\boverview\b/.test(t) &&
    /\b(pdf|generate|create|write|put|add)\b/.test(t)
  )
    return true;
  return false;
}

/**
 * Detect if user wants exact font, color, size, and style matching to the original document.
 * This is different from preserving original PDF bytes - they want newly composed content
 * that visually matches the original's typography.
 */
export function wantsExactStyleMatching(userContent: string): boolean {
  const t = userContent.toLowerCase();

  // Font matching requests
  const fontMatch =
    /\b(same|exact|identical|match|clone)\b.*\b(font|typeface|typography|text style)/.test(
      t,
    ) ||
    /\b(font|typeface|typography)\b.*\b(same|exact|identical|match|clone)/.test(
      t,
    ) ||
    /\b(exact|same)\s+font\b/.test(t) ||
    /\bfont\s+and\s+everything\s+same\b/.test(t);

  // Color matching requests
  const colorMatch =
    /\b(same|exact|identical|match|clone)\b.*\b(color|colour)/.test(t) ||
    /\b(color|colour)\b.*\b(same|exact|identical|match|clone)/.test(t) ||
    /\b(exact|same)\s+(color|colour)\b/.test(t);

  // Size matching requests
  const sizeMatch =
    /\b(same|exact|identical|match)\b.*\b(size|sizing)/.test(t) ||
    /\bsize\b.*\b(same|exact|identical|match)/.test(t) ||
    /\b(exact|same)\s+size\b/.test(t);

  // Comprehensive "everything same" requests
  const everythingMatch =
    /\b(everything|all|exactly)\s+(same|identical|like|as)\b/.test(t) ||
    /\bmatch\s+(the\s+)?(original|uploaded|source)\s+(pdf|document)\s+exactly\b/.test(
      t,
    ) ||
    /\bclone\s+(the\s+)?(style|look|appearance|formatting)\b/.test(t) ||
    /\b(same|identical)\s+(style|look|appearance|formatting)\b/.test(t);

  return fontMatch || colorMatch || sizeMatch || everythingMatch;
}

/** Extracted style info from original PDF for matching */
export type ExtractedDocumentStyle = {
  primaryFont?: string;
  primaryFontSize?: number;
  headingFont?: string;
  headingFontSize?: number;
  bodyFont?: string;
  bodyFontSize?: number;
  titleFontSize?: number;
  primaryColor?: { r: number; g: number; b: number };
  headingColor?: { r: number; g: number; b: number };
  bodyColor?: { r: number; g: number; b: number };
  backgroundColor?: { r: number; g: number; b: number };
  lineHeight?: number;
  margins?: { top: number; right: number; bottom: number; left: number };
  pageSize?: { width: number; height: number };
};

/**
 * User wants output built from the uploaded PDF bytes (subset of pages, overlays, etc.),
 * not a new PDF typeset from extracted text.
 */
export function wantsPreserveOriginalPdf(userContent: string): boolean {
  if (wantsAiComposedPdf(userContent)) return false;

  const t = userContent.toLowerCase();
  return (
    /\b(same|original|exact)\s+(pdf|document|file)\b/.test(t) ||
    /\b(this|my)\s+uploaded\s+(pdf|document|file)\b/.test(t) ||
    /\b(this|my)\s+same\s+(pdf|document|file)\b/.test(t) ||
    /\bthe\s+same\s+(uploaded\s+)?(pdf|document|file)\b/.test(t) ||
    /\bthe\s+uploaded\s+(pdf|document|file)\b/.test(t) ||
    (/\bsame\s+(uploaded\s+)?document\b/.test(t) &&
      !/\bsame\s+(text|font|color|colour|size|style)\b/.test(t)) ||
    /\bwithout\s+(any\s+)?summar/i.test(t) ||
    /\bno\s+summar/i.test(t) ||
    /\b(same|identical)\s+(as|to)\s+(the\s+|my\s+)?(upload|uploaded)\b/.test(
      t,
    ) ||
    /\bfrom\s+page\s+1\s+to\s+(the\s+)?last\b/.test(t) ||
    /\bpage\s+1\s+to\s+(the\s+)?last\b/.test(t) ||
    (/\ball\s+pages\b/.test(t) &&
      /\b(same|original|exact|full|no\s+summar|without\s+summar|preserve|unchanged)\b/.test(
        t,
      )) ||
    /\bpreserve\s+(the\s+)?(original\s+)?(pdf|document|content|file)\b/.test(
      t,
    ) ||
    /\bas\s+uploaded\b/.test(t) ||
    /\bdo\s+not\s+summar/i.test(t) ||
    /\bdon't\s+summar/i.test(t) ||
    /\bverbatim\b/.test(t) ||
    /\bfrom\s+page\s+\d+\s+to\b/.test(t) ||
    /\bpage\s+\d+\s+to\s+(?:page\s+)?\d+\b/.test(t) ||
    /\bpages?\s+\d+\s*[-–—]\s*\d+\b/.test(t) ||
    /\bfirst\s+\d+\s+pages?\b/.test(t) ||
    /\blast\s+\d+\s+pages?\b/.test(t) ||
    /\b(only|just)\s+pages?\b/.test(t) ||
    /\bextract\s+(pages?|pdf)/.test(t) ||
    /\binclude\s+pages?\b/.test(t) ||
    /\bcontent\s+from\s+(page|pages)\b/.test(t)
  );
}

/**
 * Extract document style information from the original PDF.
 * This is a heuristic approach - we sample the first page to estimate fonts and colors.
 * Full embedded font extraction would require low-level PDF parsing.
 */
export async function extractDocumentStyle(
  pdfBytes: Uint8Array,
): Promise<ExtractedDocumentStyle> {
  const style: ExtractedDocumentStyle = {};

  try {
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const page = pdfDoc.getPage(0);
    const { width, height } = page.getSize();

    // Store page dimensions
    style.pageSize = { width, height };

    // Try to get embedded fonts from the document
    // Note: pdf-lib provides limited font introspection
    const fonts: Array<{ subtype: string; baseFont: string }> = [];

    // Method 1: Try to enumerate indirect objects for fonts
    try {
      const indirectObjects = pdfDoc.context.enumerateIndirectObjects();
      for (const [, obj] of indirectObjects) {
        if (typeof obj === "object" && obj !== null) {
          const dict = obj as any;
          if (dict.dict && dict.dict.get) {
            const type = dict.dict.get("Type")?.toString();
            if (type === "/Font") {
              const subtype = dict.dict.get("Subtype")?.toString() || "";
              const baseFont = dict.dict.get("BaseFont")?.toString() || "";
              const fontName = dict.dict.get("FontName")?.toString() || "";
              fonts.push({
                subtype,
                baseFont: baseFont || fontName,
              });
            }
          }
        }
      }
    } catch (err) {
      console.log("Failed to enumerate indirect objects for fonts:", err);
    }

    // Method 2: Try to check page resources for fonts
    try {
      const page = pdfDoc.getPage(0);
      const node = pdfDoc.context.lookup(page.ref) as any;
      if (node && node.dict && node.dict.get("Resources")) {
        const resources = node.dict.get("Resources");
        if (resources && resources.dict && resources.dict.get("Font")) {
          const fontDict = resources.dict.get("Font");
          if (fontDict && fontDict.dict) {
            for (const [fontName, fontRef] of fontDict.dict.entries()) {
              if (fontRef && fontRef.toString) {
                fonts.push({
                  subtype: "Type1",
                  baseFont: fontName.toString(),
                });
              }
            }
          }
        }
      }
    } catch (err) {
      console.log("Failed to check page resources for fonts:", err);
    }

    console.log("Total fonts found:", fonts.length);

    // Map common font patterns to standard fonts
    const fontMapping: Record<string, StandardFonts> = {
      Times: StandardFonts.TimesRoman,
      TimesNewRoman: StandardFonts.TimesRoman,
      "Times-Roman": StandardFonts.TimesRoman,
      TimesNewRomanPS: StandardFonts.TimesRoman,
      Arial: StandardFonts.Helvetica,
      Helvetica: StandardFonts.Helvetica,
      Verdana: StandardFonts.Helvetica,
      Calibri: StandardFonts.Helvetica,
      Courier: StandardFonts.Courier,
      CourierNew: StandardFonts.Courier,
      Monospace: StandardFonts.Courier,
      Georgia: StandardFonts.TimesRoman,
    };

    const boldFontMapping: Record<string, StandardFonts> = {
      Times: StandardFonts.TimesRomanBold,
      TimesNewRoman: StandardFonts.TimesRomanBold,
      "Times-Roman": StandardFonts.TimesRomanBold,
      Arial: StandardFonts.HelveticaBold,
      Helvetica: StandardFonts.HelveticaBold,
      Verdana: StandardFonts.HelveticaBold,
      Calibri: StandardFonts.HelveticaBold,
      Courier: StandardFonts.CourierBold,
      CourierNew: StandardFonts.CourierBold,
      Monospace: StandardFonts.CourierBold,
      Georgia: StandardFonts.TimesRomanBold,
    };

    // Heuristic: if we found fonts, try to map them
    if (fonts.length > 0) {
      console.log(
        "Found fonts in PDF:",
        fonts.map((f) => ({ baseFont: f.baseFont, subtype: f.subtype })),
      );

      // Look for heading-like fonts (bold variants)
      const boldFont = fonts.find(
        (f) =>
          f.baseFont.toLowerCase().includes("bold") ||
          f.baseFont.toLowerCase().includes("black") ||
          f.baseFont.toLowerCase().includes("heavy"),
      );

      // Look for body fonts (regular, not bold)
      const bodyFont =
        fonts.find(
          (f) =>
            !f.baseFont.toLowerCase().includes("bold") &&
            !f.baseFont.toLowerCase().includes("italic"),
        ) || fonts[0];

      console.log("Selected bodyFont:", bodyFont?.baseFont);
      console.log("Selected boldFont:", boldFont?.baseFont);

      // Map body font to standard fonts
      if (bodyFont) {
        for (const [pattern, standardFont] of Object.entries(fontMapping)) {
          if (bodyFont.baseFont.toLowerCase().includes(pattern.toLowerCase())) {
            style.bodyFont = standardFont;
            style.primaryFont = standardFont;
            console.log(
              `Mapped body font ${bodyFont.baseFont} to ${standardFont}`,
            );
            break;
          }
        }
      }

      // Map heading font to standard fonts
      if (boldFont) {
        for (const [pattern, standardFont] of Object.entries(boldFontMapping)) {
          if (boldFont.baseFont.toLowerCase().includes(pattern.toLowerCase())) {
            style.headingFont = standardFont;
            console.log(
              `Mapped heading font ${boldFont.baseFont} to ${standardFont}`,
            );
            break;
          }
        }
      }
    } else {
      console.log("No fonts found in PDF, using defaults");
    }

    // Default font sizes based on common document conventions
    style.titleFontSize = 18;
    style.headingFontSize = 14;
    style.bodyFontSize = 11;

    // Estimate margins from page content bounds
    // Default to reasonable values if we can't determine
    style.margins = { top: 50, right: 50, bottom: 50, left: 50 };
    style.lineHeight = 1.25;

    // Default colors to black text on white background
    // In a more advanced implementation, we could parse content streams
    style.primaryColor = { r: 0.1, g: 0.1, b: 0.1 };
    style.headingColor = { r: 0.15, g: 0.15, b: 0.45 };
    style.bodyColor = { r: 0.1, g: 0.1, b: 0.1 };
    style.backgroundColor = { r: 1, g: 1, b: 1 };
  } catch (err) {
    console.error("Failed to extract document style:", err);
    // Return default styles
    return {
      primaryFont: StandardFonts.Helvetica,
      headingFont: StandardFonts.HelveticaBold,
      bodyFont: StandardFonts.Helvetica,
      titleFontSize: 18,
      headingFontSize: 14,
      bodyFontSize: 11,
      primaryColor: { r: 0.1, g: 0.1, b: 0.1 },
      headingColor: { r: 0.15, g: 0.15, b: 0.45 },
      bodyColor: { r: 0.1, g: 0.1, b: 0.1 },
      backgroundColor: { r: 1, g: 1, b: 1 },
      lineHeight: 1.25,
      margins: { top: 50, right: 50, bottom: 50, left: 50 },
      pageSize: { width: 595, height: 842 },
    };
  }

  return style;
}

function expandInclusiveRange(a: number, b: number): number[] {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const out: number[] = [];
  for (let i = lo; i <= hi; i++) out.push(i);
  return out;
}

function parseCommaPageList(chunk: string): number[] {
  const parts = chunk.split(/[,\s]+/).filter(Boolean);
  const nums: number[] = [];
  for (const p of parts) {
    if (p.toLowerCase() === "and") continue;
    const n = parseInt(p.replace(/^p\.?/i, ""), 10);
    if (!Number.isNaN(n) && n > 0) nums.push(n);
  }
  return nums;
}

/**
 * Resolve 1-based page numbers to include. Returns undefined = use all pages.
 */
export function parsePagesFromPromptLocal(
  prompt: string,
  totalPages: number,
): PdfPageSelection {
  const t = prompt.toLowerCase();

  if (/\bpage\s+\d+\s+to\s+(the\s+)?(last|end)\b/.test(t)) return undefined;
  if (/\bfrom\s+page\s+\d+\s+to\s+(the\s+)?(last|end)\b/.test(t))
    return undefined;
  if (
    /\ball\s+pages\b/.test(t) &&
    !/\bonly\s+|\bjust\s+|\bfirst\s+\d+|\blast\s+\d+/i.test(prompt)
  )
    return undefined;

  const lastN = /\blast\s+(\d+)\s+pages?\b/i.exec(prompt);
  if (lastN) {
    const n = parseInt(lastN[1], 10);
    if (n > 0) {
      const start = Math.max(1, totalPages - n + 1);
      return expandInclusiveRange(start, totalPages);
    }
  }

  const firstN = /\bfirst\s+(\d+)\s+pages?\b/i.exec(prompt);
  if (firstN) {
    const n = parseInt(firstN[1], 10);
    if (n > 0) return expandInclusiveRange(1, Math.min(n, totalPages));
  }

  const mFromTo =
    /\b(?:from\s+)?pages?\s+(\d+)\s+to\s+(?:pages?\s+)?(\d+)\b/i.exec(prompt);
  if (mFromTo) {
    const a = parseInt(mFromTo[1], 10);
    const b = parseInt(mFromTo[2], 10);
    if (a > 0 && b > 0) return expandInclusiveRange(a, b);
  }

  const mDash = /\bpages?\s+(\d+)\s*[-–—]\s*(\d+)\b/i.exec(prompt);
  if (mDash) {
    const a = parseInt(mDash[1], 10);
    const b = parseInt(mDash[2], 10);
    if (a > 0 && b > 0) return expandInclusiveRange(a, b);
  }

  const mThrough = /\bpages?\s+(\d+)\s+through\s+(\d+)\b/i.exec(prompt);
  if (mThrough) {
    const a = parseInt(mThrough[1], 10);
    const b = parseInt(mThrough[2], 10);
    if (a > 0 && b > 0) return expandInclusiveRange(a, b);
  }

  const mList =
    /\bonly\s+pages?\s+([\d,\s]+)\b/i.exec(prompt) ||
    /\bpages?\s+([\d,\s]+)\b/i.exec(prompt);
  if (mList) {
    const chunk = mList[1];
    if (!/\bto\b|\bthrough\b|[-–—]/i.test(chunk)) {
      const list = parseCommaPageList(chunk);
      if (list.length >= 2 || /\d\s*,\s*\d/.test(chunk)) {
        const uniq = [...new Set(list)].sort((x, y) => x - y);
        return uniq.length ? uniq : undefined;
      }
    }
  }

  const single =
    /\b(?:only|just)\s+page\s+(\d+)\b/i.exec(prompt) ||
    /\bpage\s+(\d+)\s+only\b/i.exec(prompt);
  if (single) {
    const n = parseInt(single[1], 10);
    if (n > 0) return [n];
  }

  return undefined;
}

function shouldResolvePagesWithAi(
  prompt: string,
  local: PdfPageSelection,
): boolean {
  if (local !== undefined) return false;
  if (!/\bpage(s)?\b/i.test(prompt)) return false;
  if (/\b(all|entire|every|full)\s+(pdf|document)\b/i.test(prompt))
    return false;
  if (/\bsummar(y|ize)/i.test(prompt)) return false;
  return (
    /\d/.test(prompt) || /\b(odd|even|skip|every|except|but)\b/i.test(prompt)
  );
}

async function fetchPagesFromAI(
  userPrompt: string,
  totalPages: number,
): Promise<PdfPageSelection> {
  if (!process.env.OPENROUTER_API_KEY) return undefined;

  const { data } = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-3.5-turbo",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `The user has a PDF with exactly ${totalPages} pages (valid page numbers are 1 through ${totalPages}). They want a NEW pdf made from a SUBSET of those pages (or all).
          Return ONLY valid JSON:
          {"includeAll": boolean, "pages": number[]}

          - If they want every page or did not restrict pages, set "includeAll": true and "pages": [].
          - Otherwise set "includeAll": false and "pages" to sorted unique 1-based page numbers to copy (in document order). Example: pages 3-5 → [3,4,5]. "First 4 pages" → [1,2,3,4]. "Last 2 pages" → [${Math.max(1, totalPages - 1)},${totalPages}] (adjust for ${totalPages}).
          - Every number must be between 1 and ${totalPages}. Omit invalid numbers.`,
        },
        { role: "user", content: userPrompt },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  const raw = data.choices?.[0]?.message?.content;
  if (!raw || typeof raw !== "string") return undefined;
  try {
    const parsed = JSON.parse(raw.trim()) as {
      includeAll?: unknown;
      pages?: unknown;
    };
    if (parsed.includeAll === true) return undefined;
    if (!Array.isArray(parsed.pages)) return undefined;
    const pages = parsed.pages
      .map((x) => Math.floor(Number(x)))
      .filter((n) => n >= 1 && n <= totalPages);
    const uniq = [...new Set(pages)].sort((a, b) => a - b);
    return uniq.length ? uniq : undefined;
  } catch {
    return undefined;
  }
}

export async function resolvePreservePageNumbers(
  userPrompt: string,
  totalPages: number,
): Promise<PdfPageSelection> {
  if (totalPages < 1) return undefined;
  let local = parsePagesFromPromptLocal(userPrompt, totalPages);
  local = local?.length ? clampAndDedupePages(local, totalPages) : local;
  if (local !== undefined) return local;
  if (shouldResolvePagesWithAi(userPrompt, local)) {
    const ai = await fetchPagesFromAI(userPrompt, totalPages);
    return ai?.length ? clampAndDedupePages(ai, totalPages) : undefined;
  }
  return undefined;
}

function clampAndDedupePages(pages1: number[], totalPages: number): number[] {
  const set = new Set<number>();
  for (const p of pages1) {
    const n = Math.floor(p);
    if (n >= 1 && n <= totalPages) set.add(n);
  }
  return [...set].sort((a, b) => a - b);
}

function parseOverlayLocal(userPrompt: string): PdfOverlayInstructions {
  const lines: string[] = [];
  for (const re of [/"([^"]+)"/g, /'([^']+)'/g]) {
    let m: RegExpExecArray | null;
    const r = new RegExp(re.source, re.flags);
    while ((m = r.exec(userPrompt)) !== null) {
      const s = m[1].trim();
      if (s && !lines.includes(s)) lines.push(s);
    }
  }
  const allPages =
    /\b(on|across|over)\s+(every|each|all)\s+page/i.test(userPrompt) ||
    /\bwatermark\b/i.test(userPrompt);
  return { lines, allPages };
}

async function fetchOverlayFromAI(
  userPrompt: string,
): Promise<PdfOverlayInstructions> {
  if (!process.env.OPENROUTER_API_KEY) {
    return { lines: [], allPages: false };
  }

  const { data } = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-3.5-turbo",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `The user will keep their existing PDF file and only wants short text drawn on it (e.g. a name or header). Do NOT summarize or rewrite document content. Do NOT output document text.

Return ONLY valid JSON: {"lines": string[], "allPages": boolean}
- "lines": each string is one line drawn at the top (first line at the top). Empty if they did not ask to add any visible text.
- "allPages": true only if they want that text on every page (watermark / each page). Otherwise false (only first page / top of document).`,
        },
        { role: "user", content: userPrompt },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  const raw = data.choices?.[0]?.message?.content;
  if (!raw || typeof raw !== "string") {
    return { lines: [], allPages: false };
  }
  try {
    const parsed = JSON.parse(raw.trim()) as {
      lines?: unknown;
      allPages?: unknown;
    };
    const lines = Array.isArray(parsed.lines)
      ? parsed.lines
          .map((x) => String(x ?? "").trim())
          .filter(Boolean)
          .slice(0, 20)
      : [];
    const allPages = Boolean(parsed.allPages);
    return { lines, allPages };
  } catch {
    return { lines: [], allPages: false };
  }
}

export async function extractPdfOverlayInstructions(
  userPrompt: string,
): Promise<PdfOverlayInstructions> {
  const local = parseOverlayLocal(userPrompt);
  if (local.lines.length > 0) {
    return local;
  }
  return fetchOverlayFromAI(userPrompt);
}

/**
 * Copies selected pages from the uploaded PDF (default: all) and optionally draws header lines.
 * Does not re-typeset document body text (no summarization).
 * @param pages1 1-based page numbers to include in order; omit or empty after resolve = all pages
 */
export async function buildPdfPreservingOriginal(
  originalPdfBytes: Uint8Array,
  overlay: PdfOverlayInstructions,
  pages1?: PdfPageSelection,
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(originalPdfBytes, {
    ignoreEncryption: true,
  });
  const pageCount = srcDoc.getPageCount();
  let indices0: number[];
  if (pages1 && pages1.length > 0) {
    const deduped = clampAndDedupePages(pages1, pageCount);
    if (deduped.length === 0) {
      throw new Error(
        "No valid pages in range for this document (check page numbers).",
      );
    }
    indices0 = deduped.map((p) => p - 1);
  } else {
    indices0 = srcDoc.getPageIndices();
  }

  const outDoc = await PDFDocument.create();
  const copiedPages = await outDoc.copyPages(srcDoc, indices0);
  for (const p of copiedPages) {
    outDoc.addPage(p);
  }

  const font = await outDoc.embedFont(StandardFonts.HelveticaBold);
  const fontSize = 12;
  const margin = 40;
  const lineGap = fontSize * 1.35;
  const textColor = rgb(0.05, 0.05, 0.05);

  if (overlay.lines.length === 0) {
    return outDoc.save();
  }

  const pages = outDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    if (!overlay.allPages && i > 0) break;
    const page = pages[i];
    const { height } = page.getSize();
    let y = height - margin;
    for (const line of overlay.lines) {
      const safe = line.length > 500 ? `${line.slice(0, 497)}...` : line;
      page.drawText(safe, {
        x: margin,
        y: y - fontSize,
        size: fontSize,
        font,
        color: textColor,
      });
      y -= lineGap;
    }
  }

  return outDoc.save();
}

function extractJsonObject(raw: string): PdfPlan {
  const trimmed = raw.trim();
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  const jsonStr = fence ? fence[1].trim() : trimmed;
  const parsed = JSON.parse(jsonStr) as PdfPlan;
  if (!parsed.title || !Array.isArray(parsed.sections)) {
    throw new Error("Invalid PDF plan shape");
  }
  return {
    title: String(parsed.title).slice(0, 500),
    sections: parsed.sections.map((s) => ({
      heading: String(s.heading ?? "Section").slice(0, 200),
      body: String(s.body ?? "").slice(0, 50000),
    })),
  };
}

export async function fetchPdfPlanFromAI(
  documentText: string,
  userPrompt: string,
): Promise<PdfPlan> {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  const { data } = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-3.5-turbo",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You design content for a NEW PDF file built from extracted text (summaries, rewrites, new structure). This is NOT a photocopy of the PDF—typesetting will use standard fonts in code.

Rules:
- Output ONLY valid JSON, no markdown.
- Shape: {"title": string, "sections": [{"heading": string, "body": string}, ...]}
- If they ask for a summary of the ENTIRE document, cover all major themes from the provided source text—nothing omitted solely because the document is long.
- Match the user's intent: sections, bullets in body text, headings, tone they asked for. If they mention matching font/color/size of the original, you cannot control that in JSON; still produce the best full summary—body should be prose or bullets as requested.
- When drawing from the source document, stay faithful; do not invent facts. Use clear section headings. Body: multiple paragraphs separated by blank lines.`,
        },
        {
          role: "user",
          content: `User request:\n${userPrompt}\n\n---\nSource document text (may be truncated):\n${documentText.slice(0, 40000)}`,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  const raw = data.choices?.[0]?.message?.content;
  if (!raw || typeof raw !== "string") {
    throw new Error("No structured response from AI");
  }
  return extractJsonObject(raw);
}

function wrapLine(
  text: string,
  maxWidth: number,
  font: PDFFont,
  fontSize: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function wrapParagraphs(
  body: string,
  maxWidth: number,
  font: PDFFont,
  fontSize: number,
): string[] {
  const out: string[] = [];
  const blocks = body.split(/\n+/);
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) {
      out.push("");
      continue;
    }
    out.push(...wrapLine(trimmed, maxWidth, font, fontSize));
  }
  return out;
}

export async function buildPdfBuffer(
  plan: PdfPlan,
  style?: ExtractedDocumentStyle,
): Promise<Uint8Array> {
  console.log("buildPdfBuffer called with style:", style);

  const pdfDoc = await PDFDocument.create();

  // Use provided style or default to Helvetica
  const bodyFontName = style?.bodyFont || StandardFonts.Helvetica;
  const headingFontName = style?.headingFont || StandardFonts.HelveticaBold;

  console.log("Using fonts - Body:", bodyFontName, "Heading:", headingFontName);

  const font = await pdfDoc.embedFont(bodyFontName);
  const bold = await pdfDoc.embedFont(headingFontName);

  // Use page size from style or default A4
  const pageWidth = style?.pageSize?.width || 595;
  const pageHeight = style?.pageSize?.height || 842;

  // Use margins from style or default
  const margin = style?.margins?.top || 50;
  const maxWidth = pageWidth - 2 * margin;

  // Use font sizes from style or default
  const titleSize = style?.titleFontSize || 18;
  const headingSize = style?.headingFontSize || 14;
  const bodySize = style?.bodyFontSize || 11;

  console.log(
    "Using sizes - Title:",
    titleSize,
    "Heading:",
    headingSize,
    "Body:",
    bodySize,
  );

  // Use colors from style or default
  const titleColor = style?.primaryColor
    ? rgb(style.primaryColor.r, style.primaryColor.g, style.primaryColor.b)
    : rgb(0.1, 0.1, 0.1);
  const headingColor = style?.headingColor
    ? rgb(style.headingColor.r, style.headingColor.g, style.headingColor.b)
    : rgb(0.15, 0.15, 0.45);
  const bodyColor = style?.bodyColor
    ? rgb(style.bodyColor.r, style.bodyColor.g, style.bodyColor.b)
    : rgb(0.1, 0.1, 0.1);

  console.log(
    "Using colors - Title:",
    style?.primaryColor,
    "Heading:",
    style?.headingColor,
    "Body:",
    style?.bodyColor,
  );

  // Use line height from style or default
  const lineHeightMult = style?.lineHeight || 1.25;
  const lineH = (size: number) => size * lineHeightMult;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const ensureSpace = (needed: number) => {
    if (y - needed < margin) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
  };

  const drawTitle = (t: string) => {
    ensureSpace(lineH(titleSize) + 8);
    page.drawText(t, {
      x: margin,
      y: y - titleSize,
      size: titleSize,
      font: bold,
      color: titleColor,
    });
    y -= lineH(titleSize) + 16;
  };

  const drawHeading = (t: string) => {
    ensureSpace(lineH(headingSize) + 8);
    page.drawText(t, {
      x: margin,
      y: y - headingSize,
      size: headingSize,
      font: bold,
      color: headingColor,
    });
    y -= lineH(headingSize) + 8;
  };

  const drawBodyLine = (line: string, size: number) => {
    if (line === "") {
      y -= lineH(size) * 0.5;
      return;
    }
    ensureSpace(lineH(size));
    page.drawText(line, {
      x: margin,
      y: y - size,
      size,
      font,
      color: bodyColor,
    });
    y -= lineH(size);
  };

  drawTitle(plan.title || "Generated document");

  const sections =
    plan.sections.length > 0
      ? plan.sections
      : [{ heading: "Content", body: "No sections were produced." }];

  for (const section of sections) {
    drawHeading(section.heading);
    const lines = wrapParagraphs(section.body, maxWidth, font, bodySize);
    for (const line of lines) {
      drawBodyLine(line, bodySize);
    }
    y -= 8;
  }

  return pdfDoc.save();
}

export async function saveGeneratedPdf(buffer: Uint8Array): Promise<string> {
  ensureGeneratedDir();
  const name = `${randomUUID()}.pdf`;
  const filePath = path.join(GENERATED_DIR, name);
  fs.writeFileSync(filePath, buffer);
  return name;
}

export function getGeneratedPdfPath(fileName: string): string | null {
  const safe = path.basename(fileName);
  if (!safe || !safe.endsWith(".pdf")) return null;
  const filePath = path.join(GENERATED_DIR, safe);
  if (!fs.existsSync(filePath)) return null;
  return filePath;
}
