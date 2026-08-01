/**
 * buildResumePDF.ts
 *
 * NOTE: PDF generation has been migrated to @react-pdf/renderer (ResumePDF.tsx).
 * This file now only exports `buildResumeText` — a plain-text serialiser used by
 * the ATS Analyzer's "Analyze Current Resume" feature.
 *
 * The plain text produced here mirrors exactly what pdfplumber extracts from
 * the downloaded PDF, so ATS analysis is consistent whether the user:
 *   a) Uploads the downloaded PDF to the ATS Analyzer, or
 *   b) Clicks "Analyze ATS" directly from the Preview page.
 */

import type { ResumeData } from '../context/ResumeContext';

/**
 * Serialises all resume sections into clean ATS-parseable plain text.
 *
 * Format mirrors the section headings that Groq's ATS scoring prompt expects:
 *   PROFESSIONAL SUMMARY, SKILLS, EXPERIENCE, PROJECTS, EDUCATION,
 *   CERTIFICATIONS, ACHIEVEMENTS, EXTRA-CURRICULAR ACTIVITIES, DECLARATION.
 *
 * Skills are broken into labelled rows (Programming:, Frameworks:, etc.)
 * so the AI can extract them individually.
 */
export function buildResumeText(data: ResumeData): string {
  const {
    personalInfo, education, experience, projects,
    skills, certifications, achievements, extra, declaration,
  } = data;

  const lines: string[] = [];

  // ── Header ─────────────────────────────────────────────────────────────────
  lines.push(
    `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim().toUpperCase()
  );

  const contacts: string[] = [];
  if (personalInfo.address) contacts.push(personalInfo.address);
  if (personalInfo.phone)   contacts.push(personalInfo.phone);
  if (personalInfo.email)   contacts.push(personalInfo.email);
  if (contacts.length) lines.push(contacts.join(' | '));

  const links: string[] = [];
  if (personalInfo.linkedin) links.push(personalInfo.linkedin);
  if (personalInfo.github)   links.push(personalInfo.github);
  if (personalInfo.portfolio) links.push(personalInfo.portfolio);
  if (links.length) lines.push(links.join(' | '));

  lines.push('');

  // ── Professional Summary ───────────────────────────────────────────────────
  if (personalInfo.summary?.trim()) {
    lines.push('PROFESSIONAL SUMMARY');
    lines.push(personalInfo.summary.trim());
    lines.push('');
  }

  // ── Skills ────────────────────────────────────────────────────────────────
  const skillRows = [
    { label: 'Programming',            vals: skills.languages  },
    { label: 'Frameworks & Libraries', vals: skills.frameworks },
    { label: 'Tools & Technologies',   vals: skills.tools      },
    { label: 'Concepts',               vals: skills.concepts   },
  ].filter(r => r.vals && r.vals.length > 0);

  if (skillRows.length > 0) {
    lines.push('SKILLS');
    for (const row of skillRows) {
      lines.push(`${row.label}: ${row.vals.join(', ')}`);
    }
    lines.push('');
  }

  // ── Experience ────────────────────────────────────────────────────────────
  if (experience.length > 0) {
    lines.push('EXPERIENCE');
    for (const exp of experience) {
      const dateStr = `${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`;
      lines.push(
        `${exp.jobTitle}` +
        `${exp.company ? ` — ${exp.company}` : ''}` +
        `${exp.location ? `, ${exp.location}` : ''}` +
        ` | ${dateStr}`
      );
      for (const resp of exp.responsibilities.filter(r => r.trim())) {
        lines.push(`• ${resp}`);
      }
      lines.push('');
    }
  }

  // ── Projects ──────────────────────────────────────────────────────────────
  if (projects.length > 0) {
    lines.push('PROJECTS');
    for (const proj of projects) {
      lines.push(
        `${proj.title}` +
        `${proj.technologies ? ` — ${proj.technologies}` : ''}` +
        `${proj.link ? ` | ${proj.link}` : ''}`
      );
      if (proj.description?.trim()) {
        for (const dl of proj.description.split('\n').filter(l => l.trim())) {
          lines.push(`• ${dl.replace(/^[-•]\s*/, '')}`);
        }
      }
      lines.push('');
    }
  }

  // ── Education ─────────────────────────────────────────────────────────────
  if (education.length > 0) {
    lines.push('EDUCATION');
    for (const edu of education) {
      lines.push(
        `${edu.degree} | ${edu.institution} | ` +
        `${edu.startYear} - ${edu.endYear}` +
        `${edu.gpa ? ` | CGPA: ${edu.gpa}` : ''}`
      );
    }
    lines.push('');
  }

  // ── Certifications ────────────────────────────────────────────────────────
  if (certifications.length > 0) {
    lines.push('CERTIFICATIONS');
    for (const cert of certifications) {
      lines.push(
        `• ${cert.name}` +
        `${cert.issuer ? ` — ${cert.issuer}` : ''}` +
        `${cert.date   ? ` (${cert.date})`   : ''}`
      );
    }
    lines.push('');
  }

  // ── Achievements ──────────────────────────────────────────────────────────
  const validAch = achievements.filter(a => a.trim());
  if (validAch.length > 0) {
    lines.push('ACHIEVEMENTS');
    for (const item of validAch) lines.push(`• ${item}`);
    lines.push('');
  }

  // ── Extra-Curricular Activities ───────────────────────────────────────────
  const validExtra = extra.filter(e => e.trim());
  if (validExtra.length > 0) {
    lines.push('EXTRA-CURRICULAR ACTIVITIES');
    for (const item of validExtra) lines.push(`• ${item}`);
    lines.push('');
  }

  // ── Declaration ───────────────────────────────────────────────────────────
  if (declaration?.trim()) {
    lines.push('DECLARATION');
    lines.push(declaration.trim());
  }

  return lines.join('\n');
}
