import axios from "axios";
import { randomUUID } from "node:crypto";
import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";

export type PdfPlan = {
  title: string;
  sections: { heading: string; body: string }[];
};

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
    /\b(open|read|view|display|show|see)\s+(the\s+|this\s+|my\s+)?pdf\b/.test(t) &&
    !/\b(create|generate|make|new|export|build|another|second|different)\b/.test(t)
  ) {
    return false;
  }

  const wantsNewFile =
    /\b(generate|create|make|export|build|produce|draft|prepare|compile)\s+(a\s+|an\s+|the\s+|my\s+|this\s+)?(\w+\s+){0,4}pdf\b/.test(
      t,
    ) ||
    /\b(generate|create|make|export|build)\s+(a\s+|an\s+|my\s+)?(new\s+)?pdf\b/.test(t) ||
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
          content: `You design content for a NEW PDF file. Follow the user's request exactly: same topics, scope, layout, and section names they asked for. Do not add extra sections or topics they did not request.

Rules:
- Output ONLY valid JSON, no markdown.
- Shape: {"title": string, "sections": [{"heading": string, "body": string}, ...]}
- Match the user's intent: if they ask for one topic, one section, multiple sections, a full summary, a rewrite, bullet-style content, or custom headings, reflect that in title and sections.
- When drawing from the source document, use relevant excerpts; if they ask for content not in the document, synthesize or note what is missing—do not invent facts.
- Use clear section headings that fit the request. Body can use multiple paragraphs separated by blank lines.`,
        },
        {
          role: "user",
          content: `User request:\n${userPrompt}\n\n---\nSource document text (may be truncated):\n${documentText.slice(0, 14000)}`,
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

export async function buildPdfBuffer(plan: PdfPlan): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 50;
  const maxWidth = pageWidth - 2 * margin;
  const titleSize = 18;
  const headingSize = 13;
  const bodySize = 11;
  const lineH = (size: number) => size * 1.25;

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
      color: rgb(0.1, 0.1, 0.1),
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
      color: rgb(0.15, 0.15, 0.45),
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
      color: rgb(0.1, 0.1, 0.1),
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
