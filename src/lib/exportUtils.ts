import { jsPDF } from 'jspdf';
import { ResearchJob, ResearchSource, Evidence, ConflictItem, CampaignBrief, CampaignAsset, ExecutionTask } from '../types';

/**
 * Escapes fields for CSV format
 */
function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Trigger browser download for a Blob
 */
export function downloadFile(content: string | Blob, filename: string, mimeType: string) {
  const blob = typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Export Evidence Items to CSV
 */
export function exportEvidenceToCSV(evidence: Evidence[], filename = 'evidence-repository.csv') {
  const headers = [
    'Evidence ID',
    'Category',
    'Claim',
    'Supporting Text / Quote',
    'Source Title',
    'Source URL',
    'Evidence Type',
    'Confidence',
    'Normalized Value',
    'Retrieved Date',
    'Research Job ID',
  ];

  const rows = evidence.map((e) => [
    escapeCsv(e.id),
    escapeCsv(e.category),
    escapeCsv(e.claim),
    escapeCsv(e.supportingText),
    escapeCsv(e.sourceTitle || ''),
    escapeCsv(e.sourceUrl),
    escapeCsv(e.evidenceType),
    escapeCsv(e.confidence),
    escapeCsv(e.normalizedValue || ''),
    escapeCsv(e.retrievedAt || ''),
    escapeCsv(e.researchJobId),
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Export Research Jobs List to CSV
 */
export function exportResearchJobsListToCSV(jobs: ResearchJob[], filename = 'research-jobs-summary.csv') {
  const headers = [
    'Job ID',
    'Business / Target Name',
    'Campaign Objective',
    'Target Audience',
    'Status',
    'Competitor URLs',
    'Sources Count',
    'Evidence Count',
    'Conflicts Count',
    'Created Date',
  ];

  const rows = jobs.map((j) => [
    escapeCsv(j.id),
    escapeCsv(j.businessName),
    escapeCsv(j.campaignObjective),
    escapeCsv(j.targetAudience),
    escapeCsv(j.status),
    escapeCsv(j.competitorUrls.join('; ')),
    escapeCsv(j.sourcesCount || 0),
    escapeCsv(j.evidenceCount || 0),
    escapeCsv(j.conflictsCount || 0),
    escapeCsv(j.createdAt),
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Comprehensive Job CSV export (Multi-section in single CSV)
 */
export function exportFullJobToCSV(data: {
  job: ResearchJob;
  sources: ResearchSource[];
  evidence: Evidence[];
  conflicts: ConflictItem[];
  campaignBrief?: CampaignBrief;
  tasks: ExecutionTask[];
}, filename?: string) {
  const fname = filename || `research-report-${data.job.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.csv`;

  const sections: string[] = [];

  // Section 1: Executive Overview
  sections.push('# SECTION 1: RESEARCH PIPELINE METADATA');
  sections.push(['Job ID', 'Business Name', 'Campaign Objective', 'Target Audience', 'Status', 'Date'].map(escapeCsv).join(','));
  sections.push([
    escapeCsv(data.job.id),
    escapeCsv(data.job.businessName),
    escapeCsv(data.job.campaignObjective),
    escapeCsv(data.job.targetAudience),
    escapeCsv(data.job.status),
    escapeCsv(data.job.createdAt),
  ].join(','));
  sections.push('');

  // Section 2: Strategy & Positioning (if available)
  if (data.campaignBrief) {
    sections.push('# SECTION 2: STRATEGIC POSITIONING BRIEF');
    sections.push(['Campaign Angle', 'Primary Message', 'Target Persona', 'Positioning Statement'].map(escapeCsv).join(','));
    sections.push([
      escapeCsv(data.campaignBrief.campaignAngle),
      escapeCsv(data.campaignBrief.primaryMessage),
      escapeCsv(data.campaignBrief.audience || data.job.targetAudience),
      escapeCsv(data.campaignBrief.positioning || ''),
    ].join(','));
    sections.push('');
  }

  // Section 3: Evidence Matrix
  sections.push('# SECTION 3: EXTRACTED EVIDENCE & VERIFIED CLAIMS');
  sections.push(['Category', 'Confidence', 'Type', 'Claim', 'Supporting Quote', 'Source URL', 'Source Title'].map(escapeCsv).join(','));
  data.evidence.forEach((e) => {
    sections.push([
      escapeCsv(e.category),
      escapeCsv(e.confidence),
      escapeCsv(e.evidenceType),
      escapeCsv(e.claim),
      escapeCsv(e.supportingText),
      escapeCsv(e.sourceUrl),
      escapeCsv(e.sourceTitle || ''),
    ].join(','));
  });
  sections.push('');

  // Section 4: Sources
  sections.push('# SECTION 4: RESEARCH SOURCES & CRAWL DATA');
  sections.push(['Source URL', 'Title', 'Status', 'HTTP Code', 'Word Count', 'Is Competitor'].map(escapeCsv).join(','));
  data.sources.forEach((s) => {
    sections.push([
      escapeCsv(s.url),
      escapeCsv(s.title || ''),
      escapeCsv(s.status),
      escapeCsv(s.httpStatus || 200),
      escapeCsv(s.wordCount || 0),
      escapeCsv(s.isCompetitor ? 'YES' : 'NO'),
    ].join(','));
  });

  const csvContent = '\uFEFF' + sections.join('\n');
  downloadFile(csvContent, fname, 'text/csv;charset=utf-8;');
}

/**
 * Generate Presentation-Grade PDF Report using jsPDF
 */
export function generateResearchJobPDF(data: {
  job: ResearchJob;
  sources: ResearchSource[];
  evidence: Evidence[];
  conflicts: ConflictItem[];
  campaignBrief?: CampaignBrief;
  assets?: CampaignAsset[];
  tasks?: ExecutionTask[];
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 20;

  const checkPageBreak = (neededSpace = 25) => {
    if (cursorY + neededSpace > pageHeight - 18) {
      doc.addPage();
      cursorY = 20;
      // Header for subsequent pages
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(130, 140, 155);
      doc.text(`Competitive Intelligence Report — ${data.job.businessName}`, margin, 12);
      doc.line(margin, 14, pageWidth - margin, 14);
      cursorY = 22;
    }
  };

  // 1. Cover / Top Banner
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.roundedRect(margin, cursorY, contentWidth, 38, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('COMPETITIVE RESEARCH & INTELLIGENCE REPORT', margin + 6, cursorY + 12);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Target Asset: ${data.job.businessName}`, margin + 6, cursorY + 20);

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}  |  Status: ${data.job.status.toUpperCase()}  |  Evidence Claims: ${data.evidence.length}`,
    margin + 6,
    cursorY + 30
  );

  cursorY += 46;

  // 2. Executive Context
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Executive Objective & Campaign Target', margin, cursorY);
  cursorY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);

  const objectiveLines = doc.splitTextToSize(`Objective: ${data.job.campaignObjective}`, contentWidth - 4);
  doc.text(objectiveLines, margin + 2, cursorY);
  cursorY += objectiveLines.length * 5 + 2;

  const audienceLines = doc.splitTextToSize(`Target Audience: ${data.job.targetAudience}`, contentWidth - 4);
  doc.text(audienceLines, margin + 2, cursorY);
  cursorY += audienceLines.length * 5 + 6;

  // 3. Strategic Angle (if brief exists)
  if (data.campaignBrief) {
    checkPageBreak(35);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, cursorY, contentWidth, 30, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.text('Strategic Angle & Positioning Mandate', margin + 5, cursorY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    const angleLines = doc.splitTextToSize(`Angle: "${data.campaignBrief.campaignAngle}"`, contentWidth - 10);
    doc.text(angleLines, margin + 5, cursorY + 15);

    const messageLines = doc.splitTextToSize(`Core Message: ${data.campaignBrief.primaryMessage}`, contentWidth - 10);
    doc.text(messageLines, margin + 5, cursorY + 23);

    cursorY += 36;
  }

  // 4. Evidence Matrix Breakdown
  checkPageBreak(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`2. Grounded Evidence Repository (${data.evidence.length} Verified Items)`, margin, cursorY);
  cursorY += 7;

  // Group evidence by category
  const categories = Array.from(new Set(data.evidence.map((e) => e.category)));

  categories.forEach((cat) => {
    const items = data.evidence.filter((e) => e.category === cat);
    checkPageBreak(25);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, cursorY, contentWidth, 6, 'F');
    doc.text(`CATEGORY: ${cat.toUpperCase()} (${items.length} findings)`, margin + 3, cursorY + 4.5);
    cursorY += 9;

    items.forEach((item, idx) => {
      checkPageBreak(22);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      const claimText = `${idx + 1}. [${item.confidence} Confidence | ${item.evidenceType}] ${item.claim}`;
      const claimLines = doc.splitTextToSize(claimText, contentWidth - 6);
      doc.text(claimLines, margin + 2, cursorY);
      cursorY += claimLines.length * 4.5 + 1;

      if (item.supportingText) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        const quoteLines = doc.splitTextToSize(`Quote: "${item.supportingText}"`, contentWidth - 10);
        doc.text(quoteLines, margin + 6, cursorY);
        cursorY += quoteLines.length * 3.8 + 1;
      }

      if (item.sourceTitle || item.sourceUrl) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(79, 70, 229);
        const srcText = `Source: ${item.sourceTitle || item.sourceUrl} (${item.sourceUrl})`;
        const srcLines = doc.splitTextToSize(srcText, contentWidth - 10);
        doc.text(srcLines, margin + 6, cursorY);
        cursorY += srcLines.length * 3.5 + 3;
      }
    });

    cursorY += 2;
  });

  // 5. Competitor URLs & Sources
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Competitor Sources Audited', margin, cursorY);
  cursorY += 7;

  data.sources.forEach((src, idx) => {
    checkPageBreak(12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    const srcLine = `${idx + 1}. ${src.title || 'Untitled Source'} — ${src.url} (${src.wordCount || 0} words, Status: ${src.status})`;
    const lines = doc.splitTextToSize(srcLine, contentWidth - 4);
    doc.text(lines, margin + 2, cursorY);
    cursorY += lines.length * 4 + 2;
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Evidence-Grounded Intelligence Report • Confidential`, margin, pageHeight - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 8);
  }

  const filename = `research-briefing-${data.job.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`;
  doc.save(filename);
}
