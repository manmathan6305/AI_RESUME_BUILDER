import React, { useState, useEffect } from 'react';
import { useResume } from '../context/ResumeContext';

/* ═══════════════════════════════════════════════════════════════════════════
   FONT
   Times New Roman = system font → renders identically in browser + html2canvas
═══════════════════════════════════════════════════════════════════════════ */
const TNR = "'Times New Roman', Times, serif";

/* ═══════════════════════════════════════════════════════════════════════════
   A4 @ 96 dpi
     210 mm = 794 px   (width)
     297 mm = 1123 px  (height)
═══════════════════════════════════════════════════════════════════════════ */
const A4_W = 794;
const A4_H = 1123;

/* ═══════════════════════════════════    ════════════════════════════════════════
   DESIGN TOKENS — single source of truth
   All spacing is in px; comments show the mm equivalent at 96 dpi.
═══════════════════════════════════════════════════════════════════════════ */
const T = {
  /* Typography */
  font: TNR,
  nameSize: '26px',
  headSize: '13.5px',
  bodySize: '12.5px',
  smallSize: '11px',
  lh: 1.42,          // line-height for body
  lhHead: 1.2,           // line-height for headings

  /* Weights */
  wNormal: 400,
  wBold: 700,

  /* Colours */
  cName: '#0d0d0d',
  cHead: '#111111',
  cBody: '#1a1a1a',
  cMuted: '#555555',
  cLink: '#1a56b0',
  cRule: '#111111',
  cPipe: '#999999',

  /* Page margins (mm → px at 96 dpi) */
  mTop: 76,   // 20 mm
  mBot: 68,   // 18 mm
  mLeft: 68,   // 18 mm
  mRight: 68,   // 18 mm

  /* Inter-section vertical gap */
  secGapTop: 13,   // px above each section heading
  secGapBot: 5,    // px below each section heading (between rule and content)

  /* Gap between items within a section (experience entries, education, etc.) */
  itemGap: 10,   // px

  /* Left indent for bullet lists */
  bulletIndent: 16,   // px
};

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════ */
const stripProtocol = (url: string) => url.replace(/^https?:\/\//, '');

/* ═══════════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */

/**
 * PageBreakSection
 * Wraps every resume section so html2pdf never slices it mid-content.
 */
const Sec: React.FC<{ children: React.ReactNode; extraTopPx?: number }> = ({
  children,
  extraTopPx = 0,
}) => (
  <div
    style={{
      pageBreakInside: 'avoid',
      breakInside: 'avoid',
      marginTop: `${T.secGapTop + extraTopPx}px`,
    }}
  >
    {children}
  </div>
);

/**
 * SectionHeading
 * ALL-CAPS bold label + full-width 2 px rule underneath.
 * The heading takes up the full content width so the rule always
 * reaches the right edge.
 */
const SectionHeading: React.FC<{ title: string }> = ({ title }) => (
  <div
    style={{
      marginBottom: `${T.secGapBot}px`,
      width: '100%',
    }}
  >
    <h2
      style={{
        fontFamily: T.font,
        fontSize: T.headSize,
        fontWeight: T.wBold,
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
        color: T.cHead,
        margin: 0,
        padding: '0 0 2px 0',
        borderBottom: `2px solid ${T.cRule}`,
        lineHeight: T.lhHead,
        width: '100%',
        boxSizing: 'border-box',
        display: 'block',
      }}
    >
      {title}
    </h2>
  </div>
);

/**
 * EntryRow
 * Two-column flex row used for every "label ··· right-value" pair.
 * Left side grows; right side is fixed-size and never wraps.
 */
const EntryRow: React.FC<{
  left: React.ReactNode;
  right: React.ReactNode;
  bold?: boolean;
  topPx?: number;
}> = ({ left, right, bold = false, topPx = 0 }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      width: '100%',
      marginTop: topPx ? `${topPx}px` : 0,
    }}
  >
    <span
      style={{
        fontFamily: T.font,
        fontSize: T.bodySize,
        fontWeight: bold ? T.wBold : T.wNormal,
        color: T.cBody,
        lineHeight: T.lh,
        flex: 1,
        minWidth: 0,          // allow flex child to shrink
        wordBreak: 'break-word',
        paddingRight: '12px',   // guaranteed gap before right column
      }}
    >
      {left}
    </span>
    <span
      style={{
        fontFamily: T.font,
        fontSize: T.smallSize,
        fontWeight: T.wBold,
        color: T.cBody,
        lineHeight: T.lh,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        textAlign: 'right',
      }}
    >
      {right}
    </span>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
const LivePreview: React.FC = () => {
  const { resumeData } = useResume();
  const [data, setData] = useState(resumeData);

  useEffect(() => {
    const t = setTimeout(() => setData(resumeData), 600);
    return () => clearTimeout(t);
  }, [resumeData]);

  const { personalInfo, education, experience, projects,
    skills, certifications, achievements, extra, declaration } = data;

  /* ── Assemble contact / link lines ── */
  const contacts: string[] = [];
  if (personalInfo.address) contacts.push(personalInfo.address);
  if (personalInfo.phone) contacts.push(personalInfo.phone);
  if (personalInfo.email) contacts.push(personalInfo.email);

  const profileLinks: string[] = [];
  if (personalInfo.linkedin) profileLinks.push(stripProtocol(personalInfo.linkedin));
  if (personalInfo.github) profileLinks.push(stripProtocol(personalInfo.github));

  /* ── Skill rows (non-empty only) ── */
  const skillRows = [
    { label: 'Programming', vals: skills.languages },
    { label: 'Frameworks & Libraries', vals: skills.frameworks },
    { label: 'Tools & Technologies', vals: skills.tools },
    { label: 'Concepts', vals: skills.concepts },
  ].filter(r => r.vals && r.vals.length > 0);

  /* ── Shared inline styles ── */

  /** Canonical body text */
  const body: React.CSSProperties = {
    fontFamily: T.font,
    fontSize: T.bodySize,
    fontWeight: T.wNormal,
    color: T.cBody,
    lineHeight: T.lh,
    margin: 0,
    padding: 0,
  };

  /** Muted / secondary body text */
  const muted: React.CSSProperties = { ...body, color: T.cMuted };

  /** Unordered list container */
  const ulStyle: React.CSSProperties = {
    margin: `4px 0 0 0`,
    padding: `0 0 0 ${T.bulletIndent}px`,
    listStyleType: 'disc',
  };

  /** List item */
  const liStyle: React.CSSProperties = {
    ...body,
    display: 'list-item',
    marginBottom: '3px',
    paddingLeft: '2px',
  };

  /** Pipe separator in header */
  const pipe = (
    <span style={{ margin: '0 9px', color: T.cPipe, fontWeight: T.wNormal }}>
      |
    </span>
  );

  /* ══════════════════════════════════════════════════════════════════════
     RENDER
     #resume-preview is pinned at 794 px (A4 width @ 96 dpi).
     html2canvas will capture exactly 794 px, and jsPDF places it 1:1
     on a 210mm A4 page — zero scaling distortion.
  ══════════════════════════════════════════════════════════════════════ */
  return (
    <div
      id="resume-preview"
      style={{
        fontFamily: T.font,
        fontSize: T.bodySize,
        color: T.cBody,
        lineHeight: T.lh,
        background: '#ffffff',
        width: `${A4_W}px`,
        minHeight: `${A4_H}px`,
        paddingTop: `${T.mTop}px`,
        paddingBottom: `${T.mBot}px`,
        paddingLeft: `${T.mLeft}px`,
        paddingRight: `${T.mRight}px`,
        boxSizing: 'border-box',
        overflowX: 'hidden',
        overflowY: 'visible',
        display: 'block',
        position: 'relative',
      }}
    >

      {/* ────────────────────────────────────────────────────────────────
          HEADER  (centred block)
      ──────────────────────────────────────────────────────────────── */}
      <div
        style={{
          textAlign: 'center',
          pageBreakInside: 'avoid',
          breakInside: 'avoid',
          marginBottom: '8px',
        }}
      >
        {/* Name */}
        <h1
          style={{
            fontFamily: T.font,
            fontSize: T.nameSize,
            fontWeight: T.wBold,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: T.cName,
            margin: '0 0 5px 0',
            padding: 0,
            lineHeight: 1.1,
            textAlign: 'center',
          }}
        >
          {personalInfo.firstName || 'Your'}&nbsp;{personalInfo.lastName || 'Name'}
        </h1>

        {/* Contact line: Address | Phone | Email */}
        {contacts.length > 0 && (
          <p
            style={{
              ...body,
              textAlign: 'center',
              margin: '0 0 2px 0',
            }}
          >
            {contacts.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && pipe}
                {c}
              </React.Fragment>
            ))}
          </p>
        )}

        {/* Profile links line: LinkedIn | GitHub */}
        {profileLinks.length > 0 && (
          <p
            style={{
              ...body,
              textAlign: 'center',
              color: T.cLink,
              margin: 0,
            }}
          >
            {profileLinks.map((lk, i) => (
              <React.Fragment key={i}>
                {i > 0 && pipe}
                <span style={{ textDecoration: 'underline' }}>{lk}</span>
              </React.Fragment>
            ))}
          </p>
        )}
      </div>

      {/* Full-width horizontal rule separating header from body */}
      <div
        style={{
          width: '100%',
          borderTop: `2px solid ${T.cRule}`,
          marginBottom: '0px',
        }}
      />

      {/* ────────────────────────────────────────────────────────────────
          PROFESSIONAL SUMMARY
      ──────────────────────────────────────────────────────────────── */}
      {personalInfo.summary && (
        <Sec>
          <SectionHeading title="Professional Summary" />
          <p style={{ ...body, textAlign: 'justify', wordBreak: 'break-word' }}>
            {personalInfo.summary}
          </p>
        </Sec>
      )}

      {/* ────────────────────────────────────────────────────────────────
          SKILLS
          Label column: fixed 160 px — aligns colon edge across all rows.
          Value column: flex:1 — wraps naturally on long skill lists.
      ──────────────────────────────────────────────────────────────── */}
      {skillRows.length > 0 && (
        <Sec>
          <SectionHeading title="Skills" />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {skillRows.map((row, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  width: '100%',
                }}
              >
                {/* Fixed-width label column — all colons align vertically */}
                <span
                  style={{
                    fontFamily: T.font,
                    fontSize: T.bodySize,
                    fontWeight: T.wBold,
                    color: T.cBody,
                    lineHeight: T.lh,
                    width: '160px',
                    flexShrink: 0,
                    paddingRight: '6px',
                  }}
                >
                  {row.label}:
                </span>
                {/* Value column */}
                <span
                  style={{
                    fontFamily: T.font,
                    fontSize: T.bodySize,
                    fontWeight: T.wNormal,
                    color: T.cBody,
                    lineHeight: T.lh,
                    flex: 1,
                    wordBreak: 'break-word',
                  }}
                >
                  {row.vals.join(', ')}
                </span>
              </div>
            ))}
          </div>
        </Sec>
      )}

      {/* ────────────────────────────────────────────────────────────────
          EXPERIENCE
      ──────────────────────────────────────────────────────────────── */}
      {experience.length > 0 && (
        <Sec>
          <SectionHeading title="Experience" />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${T.itemGap}px`,
            }}
          >
            {experience.map((exp, idx) => (
              <div
                key={idx}
                style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
              >
                {/* Row 1: Job Title — Company, Location ··· Date range */}
                <EntryRow
                  bold
                  left={
                    <>
                      {exp.jobTitle}
                      {exp.company && (
                        <span style={{ fontWeight: T.wNormal }}>
                          {' \u2014 '}{exp.company}
                          {exp.location ? `, ${exp.location}` : ''}
                        </span>
                      )}
                    </>
                  }
                  right={
                    <>{exp.startDate}&nbsp;&ndash;&nbsp;{exp.current ? 'Present' : exp.endDate}</>
                  }
                />

                {/* Bullet responsibilities */}
                {exp.responsibilities.some(r => r.trim()) && (
                  <ul style={ulStyle}>
                    {exp.responsibilities
                      .filter(r => r.trim())
                      .map((r, ri) => (
                        <li key={ri} style={liStyle}>{r}</li>
                      ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Sec>
      )}

      {/* ────────────────────────────────────────────────────────────────
          PROJECTS
      ──────────────────────────────────────────────────────────────── */}
      {projects.length > 0 && (
        <Sec>
          <SectionHeading title="Projects" />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${T.itemGap}px`,
            }}
          >
            {projects.map((proj, idx) => (
              <div
                key={idx}
                style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
              >
                {/* Row: Title — Tech ··· link */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    width: '100%',
                  }}
                >
                  <span
                    style={{
                      ...body,
                      flex: 1,
                      wordBreak: 'break-word',
                      paddingRight: '12px',
                    }}
                  >
                    <span style={{ fontWeight: T.wBold }}>{proj.title}</span>
                    {proj.technologies && (
                      <span style={{ fontStyle: 'italic', color: T.cMuted }}>
                        {' \u2014 '}{proj.technologies}
                      </span>
                    )}
                  </span>
                  {proj.link && (
                    <span
                      style={{
                        fontFamily: T.font,
                        fontSize: T.smallSize,
                        fontWeight: T.wNormal,
                        color: T.cLink,
                        textDecoration: 'underline',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        lineHeight: T.lh,
                      }}
                    >
                      {stripProtocol(proj.link)}
                    </span>
                  )}
                </div>

                {/* Description as bullets */}
                {proj.description && (
                  <ul style={ulStyle}>
                    {proj.description
                      .split('\n')
                      .filter(l => l.trim())
                      .map((line, li) => (
                        <li key={li} style={liStyle}>
                          {line.replace(/^[-•]\s*/, '')}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Sec>
      )}

      {/* ────────────────────────────────────────────────────────────────
          EDUCATION
      ──────────────────────────────────────────────────────────────── */}
      {education.length > 0 && (
        <Sec>
          <SectionHeading title="Education" />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${T.itemGap}px`,
            }}
          >
            {education.map((edu, idx) => (
              <div
                key={idx}
                style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
              >
                {/* Row 1: Degree ··· Year range */}
                <EntryRow
                  bold
                  left={edu.degree}
                  right={<>{edu.startYear}&nbsp;&ndash;&nbsp;{edu.endYear}</>}
                />
                {/* Row 2: Institution ··· CGPA */}
                <EntryRow
                  left={
                    <span style={{ color: T.cMuted }}>{edu.institution}</span>
                  }
                  right={
                    edu.gpa
                      ? <span style={{ fontWeight: T.wNormal, color: T.cMuted }}>CGPA:&nbsp;{edu.gpa}</span>
                      : null
                  }
                />
              </div>
            ))}
          </div>
        </Sec>
      )}

      {/* ────────────────────────────────────────────────────────────────
          CERTIFICATIONS
      ──────────────────────────────────────────────────────────────── */}
      {certifications.length > 0 && (
        <Sec>
          <SectionHeading title="Certifications" />
          <ul style={ulStyle}>
            {certifications.map((cert, idx) => (
              <li key={idx} style={liStyle}>
                <span style={{ fontWeight: T.wBold }}>{cert.name}</span>
                {cert.issuer && (
                  <span style={{ fontWeight: T.wNormal }}>
                    {' \u2014 '}{cert.issuer}
                  </span>
                )}
                {cert.date && (
                  <span style={{ color: T.cMuted, fontSize: T.smallSize }}>
                    &nbsp;({cert.date})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Sec>
      )}

      {/* ────────────────────────────────────────────────────────────────
          ACHIEVEMENTS
      ──────────────────────────────────────────────────────────────── */}
      {achievements.length > 0 && achievements.some(a => a.trim()) && (
        <Sec>
          <SectionHeading title="Achievements" />
          <ul style={ulStyle}>
            {achievements.filter(a => a.trim()).map((item, idx) => (
              <li key={idx} style={liStyle}>{item}</li>
            ))}
          </ul>
        </Sec>
      )}

      {/* ────────────────────────────────────────────────────────────────
          EXTRA-CURRICULAR ACTIVITIES
      ──────────────────────────────────────────────────────────────── */}
      {extra.length > 0 && extra.some(e => e.trim()) && (
        <Sec>
          <SectionHeading title="Extra-Curricular Activities" />
          <ul style={ulStyle}>
            {extra.filter(e => e.trim()).map((item, idx) => (
              <li key={idx} style={liStyle}>{item}</li>
            ))}
          </ul>
        </Sec>
      )}

      {/* ────────────────────────────────────────────────────────────────
          DECLARATION
      ──────────────────────────────────────────────────────────────── */}
      {declaration && (
        <Sec extraTopPx={6}>
          <SectionHeading title="Declaration" />
          <p style={{ ...body, fontStyle: 'italic', color: T.cMuted }}>
            {declaration}
          </p>
        </Sec>
      )}

    </div>
  );
};

export default LivePreview;