import { jsPDF } from 'jspdf';
import { GitRepository } from '../types/git';

/**
 * Generates and downloads the full Markdown onboarding guide.
 */
export function exportOnboardingMarkdown(
  repo: GitRepository,
  annotations: Record<string, string>
): void {
  const commits = repo.commits || [];
  const markdownLines: string[] = [
    `# GitReplay Onboarding Report: ${repo.owner}/${repo.name}`,
    ``,
    `> ${repo.description || ''}`,
    ``,
    `## Chronological Evolution (${commits.length} Commits)`,
    ``,
  ];

  commits.forEach((c, idx) => {
    markdownLines.push(`### ${idx + 1}. [${c.shortSha}] ${c.title}`);
    markdownLines.push(
      `- **Author**: ${c.author} (${c.authorRole}) · **Date**: ${c.timestamp} · **Category**: ${c.category}`
    );
    markdownLines.push(`- **Problem**: ${c.adr?.problemStatement || 'N/A'}`);
    markdownLines.push(`- **Decision**: ${c.adr?.decisionSummary || c.message || 'N/A'}`);
    if (annotations[c.sha]) {
      markdownLines.push(`- **Note**: ${annotations[c.sha]}`);
    }
    markdownLines.push(``);
  });

  const blob = new Blob([markdownLines.join('\n')], {
    type: 'text/markdown;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${repo.name}-gitreplay-guide.md`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Sanitizes characters outside standard WinAnsi range for jsPDF built-in Helvetica font.
 */
function pdfSafeText(text: string): string {
  return (text || '')
    .replace(/[—–]/g, '-')
    .replace(/·/g, '|')
    .replace(/→/g, '->')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\x20-\x7E\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates and downloads a concise, summarized PDF onboarding report for Day-1 engineers.
 */
export function exportOnboardingSummaryPdf(
  repo: GitRepository,
  annotations: Record<string, string>
): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 44;
  const contentWidth = pageWidth - marginX * 2;
  const bottomLimit = pageHeight - 48;

  let y = 48;

  const ensureSpace = (neededPt: number) => {
    if (y + neededPt > bottomLimit) {
      doc.addPage();
      y = 48;
    }
  };

  const drawWrapped = (
    text: string,
    x: number,
    maxWidth: number,
    lineHeight: number,
    fontSize: number,
    color: [number, number, number],
    fontStyle: 'normal' | 'bold' = 'normal'
  ) => {
    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(pdfSafeText(text), maxWidth) as string[];
    for (const line of lines) {
      ensureSpace(lineHeight);
      doc.text(line, x, y);
      y += lineHeight;
    }
  };

  const commits = repo.commits || [];
  const authors = new Set(commits.map((c) => c.author).filter(Boolean));
  const firstDate = commits[0]?.timestamp?.split(' ')[0] || '-';
  const lastDate = commits[commits.length - 1]?.timestamp?.split(' ')[0] || '-';
  const dateRange = firstDate === lastDate ? firstDate : `${firstDate} to ${lastDate}`;
  const taggedCommit = [...commits].reverse().find((c) => c.tag);
  const currentVersion =
    taggedCommit?.tag || commits[commits.length - 1]?.shortSha || 'HEAD';
  const milestones = commits.filter((c) => c.isArchitecturalMilestone);
  const keyMilestones =
    milestones.length > 0 ? milestones.slice(0, 4) : commits.slice(0, 3);
  const latestModules = commits[commits.length - 1]?.adr?.modules || [];
  const savedNoteCount = commits.filter((c) => Boolean(annotations[c.sha]?.trim())).length;

  // --- Header Banner ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(14, 165, 233); // Sky-500 accent
  doc.text('GITREPLAY ONBOARDING SUMMARY', marginX, y);
  y += 18;

  drawWrapped(
    `${repo.owner}/${repo.name}`,
    marginX,
    contentWidth,
    24,
    20,
    [15, 23, 42],
    'bold'
  );
  y += 2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    pdfSafeText(
      `Branch: ${repo.defaultBranch}  |  Language: ${repo.primaryLanguage}  |  Generated: ${new Date()
        .toISOString()
        .slice(0, 10)}`
    ),
    marginX,
    y
  );
  y += 14;

  // Accent divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(1);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 16;

  // --- Module Summary ---
  if (repo.description) {
    drawWrapped(repo.description, marginX, contentWidth, 14, 10.5, [51, 65, 85], 'normal');
    y += 10;
  }

  // --- Key Stats Row (4 columns) ---
  ensureSpace(58);
  const statBoxWidth = (contentWidth - 24) / 4;
  const stats = [
    { label: 'COMMITS', value: String(commits.length) },
    { label: 'CONTRIBUTORS', value: String(authors.size) },
    { label: 'VERSION', value: pdfSafeText(currentVersion) },
    { label: 'TIMELINE', value: pdfSafeText(dateRange) },
  ];

  stats.forEach((stat, idx) => {
    const bx = marginX + idx * (statBoxWidth + 8);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(bx, y, statBoxWidth, 44, 4, 4, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(stat.label, bx + 10, y + 15);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    const valText = doc.splitTextToSize(stat.value, statBoxWidth - 18)[0] || '-';
    doc.text(valText, bx + 10, y + 32);
  });
  y += 62;

  // --- Section 1: Current Architecture Snapshot ---
  if (latestModules.length > 0) {
    ensureSpace(44);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('1. Current Architecture Snapshot', marginX, y);
    y += 16;

    for (const mod of latestModules.slice(0, 6)) {
      ensureSpace(28);
      const metricPart = mod.metrics ? ` (${pdfSafeText(mod.metrics)})` : '';
      const line = `[${mod.layer.toUpperCase()}] ${mod.name}${metricPart} - ${mod.description}`;
      drawWrapped(line, marginX + 8, contentWidth - 8, 13, 9.5, [51, 65, 85], 'normal');
      y += 2;
    }
    y += 10;
  }

  // --- Section 2: Key Milestones to Understand First ---
  if (keyMilestones.length > 0) {
    ensureSpace(44);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('2. Key Architectural Milestones', marginX, y);
    y += 16;

    keyMilestones.forEach((c) => {
      ensureSpace(64);
      const tagLabel = c.tag ? ` (${c.tag})` : '';
      drawWrapped(
        `[${c.shortSha}]${tagLabel} ${c.title}`,
        marginX,
        contentWidth,
        14,
        10.5,
        [15, 23, 42],
        'bold'
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        pdfSafeText(`${c.author}  |  ${c.timestamp.split(' ')[0] || '-'}  |  ${c.category}`),
        marginX,
        y
      );
      y += 12;

      const decision = c.adr?.decisionSummary || c.message || '';
      if (decision) {
        drawWrapped(`Decision: ${decision}`, marginX + 8, contentWidth - 8, 13, 9.5, [51, 65, 85]);
      }
      if (c.adr?.measurableOutcome) {
        drawWrapped(
          `Outcome: ${c.adr.measurableOutcome}`,
          marginX + 8,
          contentWidth - 8,
          13,
          9,
          [14, 116, 144]
        );
      }
      y += 8;
    });
  }

  // --- Section 3: Chronological Commit Digest ---
  if (commits.length > 0) {
    ensureSpace(48);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(
      `3. Chronological Evolution Digest (${commits.length} commits${
        savedNoteCount > 0 ? `, ${savedNoteCount} annotated` : ''
      })`,
      marginX,
      y
    );
    y += 16;

    commits.forEach((c, idx) => {
      ensureSpace(34);
      const dateStr = c.timestamp?.split(' ')[0] || '-';
      drawWrapped(
        `${idx + 1}. [${c.shortSha}] ${c.title}`,
        marginX,
        contentWidth,
        13,
        9.5,
        [15, 23, 42],
        'bold'
      );

      const summary =
        (c.adr?.decisionSummary || c.message || '').slice(0, 180) +
        ((c.adr?.decisionSummary || c.message || '').length > 180 ? '...' : '');
      drawWrapped(
        `${dateStr} | ${c.category} | ${c.author} - ${summary}`,
        marginX + 10,
        contentWidth - 10,
        12,
        8.5,
        [71, 85, 105]
      );

      const note = annotations[c.sha]?.trim();
      if (note) {
        drawWrapped(`Note: ${note}`, marginX + 10, contentWidth - 10, 12, 8.5, [14, 116, 144]);
      }
      y += 4;
    });
  }

  // --- Page Footers ---
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(marginX, pageHeight - 32, pageWidth - marginX, pageHeight - 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(pdfSafeText(`GitReplay | ${repo.owner}/${repo.name}`), marginX, pageHeight - 19);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - marginX, pageHeight - 19, {
      align: 'right',
    });
  }

  doc.save(`${repo.name}-onboarding-summary.pdf`);
}
