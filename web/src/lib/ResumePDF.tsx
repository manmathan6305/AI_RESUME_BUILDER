/**
 * ResumePDF.tsx
 *
 * @react-pdf/renderer — the definitive ATS-compatible PDF approach:
 *
 *   ✅  Pure vector PDF — NO html2canvas, NO JPEG rasterization
 *   ✅  Selectable & searchable text in every PDF viewer
 *   ✅  Real <Link> hyperlink annotations (LinkedIn, GitHub, projects)
 *   ✅  Automatic multi-page with per-entry break control
 *   ✅  Cross-browser consistent (pure JS PDF engine — browser-independent)
 *   ✅  Zero blur / zero scaling artifacts (vector, not bitmap)
 *   ✅  Built-in Times-Roman / Times-Bold / Times-Italic (standard PDF fonts)
 *   ✅  Document metadata: title, author, subject, keywords
 *
 * PREVIEW ↔ PDF VISUAL CONSISTENCY
 * ──────────────────────────────────
 * All measurements are derived from the same design tokens as LivePreview.tsx
 * (font sizes converted px→pt, margins converted px→mm):
 *
 *   LivePreview token  │ px value │ PDF unit  │ Constant
 *   ───────────────────┼──────────┼───────────┼──────────────────
 *   nameSize           │ 26px     │ 18pt      │ FS.name  = 18
 *   headSize           │ 13.5px   │ 10pt      │ FS.sect  = 10
 *   bodySize           │ 12.5px   │ 9.5pt     │ FS.body  = 9.5
 *   smallSize          │ 11px     │ 8pt       │ FS.small = 8
 *   lh:1.42            │  —       │ 1.42      │ LH       = 1.42
 *   mTop:76px          │ 20mm     │ '20mm'    │ PAGE.mTop
 *   mLeft/Right:68px   │ 18mm     │ '18mm'    │ PAGE.mH
 *   secGapTop:13px     │ 3.5mm    │ 9pt       │ SP.sectionTop
 *   bulletIndent:16px  │ 4.2mm    │ 10pt      │ BUL.textX
 *   itemGap:10px       │ 2.6mm    │ 7pt       │ SP.itemGap
 */

import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  Link,
  StyleSheet,
} from '@react-pdf/renderer';
import type { ResumeData } from '../context/ResumeContext';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const stripProto  = (u: string) => u.replace(/^https?:\/\//, '');
const ensureHttps = (u: string) => /^https?:\/\//.test(u) ? u : `https://${u}`;

// ─── Design tokens ───────────────────────────────────────────────────────────

/** Built-in standard PDF fonts — no embedding required, zero load time */
const F = {
  normal:     'Times-Roman',
  bold:       'Times-Bold',
  italic:     'Times-Italic',
  boldItalic: 'Times-BoldItalic',
};

/** Font sizes in pt (px × 0.75 at 96 dpi) */
const FS = {
  name:  18,    // 26px → 19.5pt → 18pt
  sect:  10,    // 13.5px → 10.1pt → 10pt
  body:   9.5,  // 12.5px → 9.4pt  → 9.5pt
  small:  8,    // 11px   → 8.25pt → 8pt
};

const LH = 1.42;  // line-height multiplier — mirrors LivePreview T.lh

/** Colours — mirrors LivePreview T.c* */
const C = {
  black: '#0d0d0d',
  head:  '#111111',
  body:  '#1a1a1a',
  muted: '#555555',
  link:  '#1a56b0',
};

/** Page geometry — mirrors LivePreview margins exactly */
const PAGE = {
  mTop:  '20mm',   // 76px  → 20mm
  mBot:  '18mm',   // 68px  → 18mm
  mH:    '18mm',   // 68px  → 18mm (left & right)
};

/** Spacing values in pt — mirrors LivePreview gap tokens */
const SP = {
  sectionTop:  9,   // secGapTop 13px → 3.5mm ≈ 9pt
  sectionBot:  4,   // secGapBot  5px → 1.3mm ≈ 4pt
  itemGap:     7,   // itemGap   10px → 2.6mm ≈ 7pt
  headerRule:  4,   // gap above the full-width rule
};

/** Bullet indent — mirrors LivePreview bulletIndent:16px */
const BUL = {
  dotX:   4,    // x of bullet char from left edge of content
  textX: 10,    // x of bullet text (after bullet + gap)
};

// ─── StyleSheet ───────────────────────────────────────────────────────────────

const S = StyleSheet.create({

  // ── Page ──────────────────────────────────────────────────────────────────
  page: {
    fontFamily:    F.normal,
    fontSize:      FS.body,
    lineHeight:    LH,
    color:         C.body,
    backgroundColor: '#ffffff',
    paddingTop:    PAGE.mTop,
    paddingBottom: PAGE.mBot,
    paddingLeft:   PAGE.mH,
    paddingRight:  PAGE.mH,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  headerWrap: {
    alignItems:   'center',
    marginBottom:  3,
  },
  name: {
    fontFamily:    F.bold,
    fontSize:      FS.name,
    color:         C.black,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign:     'center',
    marginBottom:  3,
  },
  contactLine: {
    fontFamily: F.normal,
    fontSize:   FS.body,
    color:      C.body,
    textAlign:  'center',
    marginBottom: 2,
  },
  linkRow: {
    flexDirection:  'row',
    justifyContent: 'center',
    alignItems:     'center',
    flexWrap:       'wrap',
  },
  linkItem: {
    fontFamily:     F.normal,
    fontSize:       FS.body,
    color:          C.link,
    textDecoration: 'underline',
  },
  linkSep: {
    fontFamily:  F.normal,
    fontSize:    FS.body,
    color:       '#999999',
    marginLeft:  6,
    marginRight: 6,
  },

  // ── Header rule ───────────────────────────────────────────────────────────
  hRule: {
    borderBottomWidth: 1.5,
    borderBottomColor: C.head,
    marginTop:    SP.headerRule,
    marginBottom: 0,
  },

  // ── Section heading ───────────────────────────────────────────────────────
  secWrap: {
    marginTop: SP.sectionTop,
  },
  secHeadView: {
    borderBottomWidth: 1,
    borderBottomColor: C.head,
    paddingBottom:     2,
    marginBottom:      SP.sectionBot,
  },
  secHeadText: {
    fontFamily:    F.bold,
    fontSize:      FS.sect,
    color:         C.head,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },

  // ── Two-column entry row ──────────────────────────────────────────────────
  entryRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   1,
  },
  entryLeft: {
    flex:         1,
    paddingRight: 10,
  },
  entryRight: {
    flexShrink: 0,
    textAlign:  'right',
  },

  // ── Body typography ───────────────────────────────────────────────────────
  bodyText:    { fontFamily: F.normal,     fontSize: FS.body,  color: C.body,  lineHeight: LH },
  boldText:    { fontFamily: F.bold,       fontSize: FS.body,  color: C.body,  lineHeight: LH },
  mutedText:   { fontFamily: F.normal,     fontSize: FS.body,  color: C.muted, lineHeight: LH },
  italicMuted: { fontFamily: F.italic,     fontSize: FS.body,  color: C.muted, lineHeight: LH },
  smallBold:   { fontFamily: F.bold,       fontSize: FS.small, color: C.body  },
  smallMuted:  { fontFamily: F.normal,     fontSize: FS.small, color: C.muted },
  smallLink:   { fontFamily: F.normal,     fontSize: FS.small, color: C.link,  textDecoration: 'underline' },

  // ── Bullet list ───────────────────────────────────────────────────────────
  bulletRow: {
    flexDirection: 'row',
    marginBottom:  1.5,
  },
  bulletDot: {
    fontFamily: F.normal,
    fontSize:   FS.body,
    color:      C.body,
    width:      BUL.textX,
    flexShrink: 0,
  },
  bulletText: {
    fontFamily: F.normal,
    fontSize:   FS.body,
    color:      C.body,
    flex:       1,
    lineHeight: LH,
  },

  // ── Skills two-column ─────────────────────────────────────────────────────
  skillRow: {
    flexDirection: 'row',
    marginBottom:  2,
  },
  skillLabel: {
    fontFamily: F.bold,
    fontSize:   FS.body,
    color:      C.body,
    width:      '38%',
    flexShrink: 0,
  },
  skillValue: {
    fontFamily: F.normal,
    fontSize:   FS.body,
    color:      C.body,
    flex:       1,
    lineHeight: LH,
  },

  // ── Entry wrapper ─────────────────────────────────────────────────────────
  entryItem: {
    marginBottom: SP.itemGap,
  },
});

// ─── Reusable sub-components ─────────────────────────────────────────────────

/** Section heading: UPPERCASE BOLD + full-width bottom border */
const SH: React.FC<{ title: string }> = ({ title }) => (
  <View style={S.secWrap}>
    <View style={S.secHeadView}>
      <Text style={S.secHeadText}>{title.toUpperCase()}</Text>
    </View>
  </View>
);

/** Bullet point with hanging indent */
const Bul: React.FC<{ text: string }> = ({ text }) => (
  <View style={S.bulletRow}>
    <Text style={S.bulletDot}>{'\u2022'}</Text>
    <Text style={S.bulletText}>{text}</Text>
  </View>
);

// ─── Main PDF document component ─────────────────────────────────────────────

export const ResumePDF: React.FC<{ data: ResumeData }> = ({ data }) => {
  const {
    personalInfo, education, experience,
    projects, skills, certifications,
    achievements, extra, declaration,
  } = data;

  // ── Header data ────────────────────────────────────────────────────────────
  const contacts: string[] = [];
  if (personalInfo.address) contacts.push(personalInfo.address);
  if (personalInfo.phone)   contacts.push(personalInfo.phone);
  if (personalInfo.email)   contacts.push(personalInfo.email);

  const profileLinks = (
    [
      personalInfo.linkedin
        ? { label: stripProto(personalInfo.linkedin), url: ensureHttps(personalInfo.linkedin) }
        : null,
      personalInfo.github
        ? { label: stripProto(personalInfo.github),   url: ensureHttps(personalInfo.github) }
        : null,
    ] as ({ label: string; url: string } | null)[]
  ).filter(Boolean) as { label: string; url: string }[];

  // ── Skills rows (non-empty only) ────────────────────────────────────────────
  const skillRows = [
    { label: 'Programming:',            vals: skills.languages  },
    { label: 'Frameworks & Libraries:', vals: skills.frameworks },
    { label: 'Tools & Technologies:',   vals: skills.tools      },
    { label: 'Concepts:',               vals: skills.concepts   },
  ].filter(r => r.vals && r.vals.length > 0);

  // ── Clean arrays ────────────────────────────────────────────────────────────
  const validAch   = achievements.filter(a => a.trim());
  const validExtra = extra.filter(e => e.trim());

  return (
    <Document
      title={`${personalInfo.firstName} ${personalInfo.lastName} — Resume`.trim()}
      author={`${personalInfo.firstName} ${personalInfo.lastName}`.trim()}
      subject="Professional Resume"
      creator="AI Resume Builder"
      keywords="resume, CV, professional"
    >
      <Page size="A4" style={S.page}>

        {/* ══════════════════════════════════════════════════════════════
            HEADER
        ══════════════════════════════════════════════════════════════ */}
        <View style={S.headerWrap} wrap={false}>

          {/* Name */}
          <Text style={S.name}>
            {(personalInfo.firstName || 'Your') + ' ' + (personalInfo.lastName || 'Name')}
          </Text>

          {/* Contact: Address | Phone | Email */}
          {contacts.length > 0 && (
            <Text style={S.contactLine}>
              {contacts.join('   |   ')}
            </Text>
          )}

          {/* Profile links — real clickable PDF annotations */}
          {profileLinks.length > 0 && (
            <View style={S.linkRow}>
              {profileLinks.map((lk, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <Text style={S.linkSep}>|</Text>}
                  <Link src={lk.url} style={S.linkItem}>{lk.label}</Link>
                </React.Fragment>
              ))}
            </View>
          )}
        </View>

        {/* Full-width divider rule below header */}
        <View style={S.hRule} />

        {/* ══════════════════════════════════════════════════════════════
            PROFESSIONAL SUMMARY
        ══════════════════════════════════════════════════════════════ */}
        {personalInfo.summary?.trim() && (
          <View wrap={false}>
            <SH title="Professional Summary" />
            <Text style={S.bodyText}>{personalInfo.summary}</Text>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════════════
            SKILLS  (two-column: label | values)
        ══════════════════════════════════════════════════════════════ */}
        {skillRows.length > 0 && (
          <View wrap={false}>
            <SH title="Skills" />
            {skillRows.map((row, i) => (
              <View key={i} style={S.skillRow}>
                <Text style={S.skillLabel}>{row.label}</Text>
                <Text style={S.skillValue}>{row.vals.join(', ')}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ══════════════════════════════════════════════════════════════
            EXPERIENCE
        ══════════════════════════════════════════════════════════════ */}
        {experience.length > 0 && (
          <>
            <SH title="Experience" />
            {experience.map((exp, i) => (
              <View key={i} style={S.entryItem} wrap={false}>

                {/* Row: Job Title — Company, Location  ···  Date */}
                <View style={S.entryRow}>
                  <View style={S.entryLeft}>
                    <Text style={S.boldText}>
                      {exp.jobTitle}
                      {exp.company
                        ? <Text style={{ fontFamily: F.normal, color: C.body }}>
                            {' \u2014 '}{exp.company}{exp.location ? `, ${exp.location}` : ''}
                          </Text>
                        : null}
                    </Text>
                  </View>
                  <Text style={[S.smallBold, S.entryRight]}>
                    {exp.startDate}{' \u2013 '}{exp.current ? 'Present' : exp.endDate}
                  </Text>
                </View>

                {/* Responsibility bullets */}
                {exp.responsibilities
                  .filter(r => r.trim())
                  .map((resp, ri) => <Bul key={ri} text={resp} />)}
              </View>
            ))}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════
            PROJECTS
        ══════════════════════════════════════════════════════════════ */}
        {projects.length > 0 && (
          <>
            <SH title="Projects" />
            {projects.map((proj, i) => (
              <View key={i} style={S.entryItem} wrap={false}>

                {/* Row: Title — Tech  ···  Link */}
                <View style={S.entryRow}>
                  <View style={S.entryLeft}>
                    <Text style={S.boldText}>
                      {proj.title}
                      {proj.technologies
                        ? <Text style={{ fontFamily: F.italic, color: C.muted }}>
                            {' \u2014 '}{proj.technologies}
                          </Text>
                        : null}
                    </Text>
                  </View>
                  {proj.link && (
                    <Link
                      src={ensureHttps(proj.link)}
                      style={[S.smallLink, S.entryRight]}
                    >
                      {stripProto(proj.link)}
                    </Link>
                  )}
                </View>

                {/* Description bullets */}
                {proj.description?.trim() &&
                  proj.description
                    .split('\n')
                    .filter(l => l.trim())
                    .map((line, li) => (
                      <Bul key={li} text={line.replace(/^[-•]\s*/, '')} />
                    ))}
              </View>
            ))}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════
            EDUCATION
        ══════════════════════════════════════════════════════════════ */}
        {education.length > 0 && (
          <>
            <SH title="Education" />
            {education.map((edu, i) => (
              <View key={i} style={S.entryItem} wrap={false}>

                {/* Row 1: Degree  ···  Year range */}
                <View style={S.entryRow}>
                  <Text style={[S.boldText, S.entryLeft]}>{edu.degree}</Text>
                  <Text style={[S.smallBold, S.entryRight]}>
                    {edu.startYear}{' \u2013 '}{edu.endYear}
                  </Text>
                </View>

                {/* Row 2: Institution  ···  CGPA */}
                <View style={S.entryRow}>
                  <Text style={[S.mutedText, S.entryLeft]}>{edu.institution}</Text>
                  {edu.gpa && (
                    <Text style={[S.smallMuted, S.entryRight]}>CGPA: {edu.gpa}</Text>
                  )}
                </View>
              </View>
            ))}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════
            CERTIFICATIONS
        ══════════════════════════════════════════════════════════════ */}
        {certifications.length > 0 && (
          <View wrap={false}>
            <SH title="Certifications" />
            {certifications.map((cert, i) => (
              <View key={i} style={S.bulletRow}>
                <Text style={S.bulletDot}>{'\u2022'}</Text>
                <Text style={S.bulletText}>
                  <Text style={{ fontFamily: F.bold }}>{cert.name}</Text>
                  {cert.issuer
                    ? <Text style={{ fontFamily: F.normal, color: C.body }}>
                        {' \u2014 '}{cert.issuer}
                      </Text>
                    : null}
                  {cert.date
                    ? <Text style={{ fontFamily: F.normal, color: C.muted }}>
                        {' ('}{cert.date}{')'}
                      </Text>
                    : null}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ══════════════════════════════════════════════════════════════
            ACHIEVEMENTS
        ══════════════════════════════════════════════════════════════ */}
        {validAch.length > 0 && (
          <View wrap={false}>
            <SH title="Achievements" />
            {validAch.map((item, i) => <Bul key={i} text={item} />)}
          </View>
        )}

        {/* ══════════════════════════════════════════════════════════════
            EXTRA-CURRICULAR ACTIVITIES
        ══════════════════════════════════════════════════════════════ */}
        {validExtra.length > 0 && (
          <View wrap={false}>
            <SH title="Extra-Curricular Activities" />
            {validExtra.map((item, i) => <Bul key={i} text={item} />)}
          </View>
        )}

        {/* ══════════════════════════════════════════════════════════════
            DECLARATION
        ══════════════════════════════════════════════════════════════ */}
        {declaration?.trim() && (
          <View wrap={false}>
            <SH title="Declaration" />
            <Text style={S.italicMuted}>{declaration}</Text>
          </View>
        )}

      </Page>
    </Document>
  );
};
