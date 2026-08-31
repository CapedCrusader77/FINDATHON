import { DashboardData, DuplicateGroup, ScanRecord, QuarantineItem } from '../types'

const now = new Date()
const ago = (days: number, hours = 0) => new Date(now.getTime() - (days * 86400000 + hours * 3600000)).toISOString()

export const demoDashboard: DashboardData = {
  isDemo: true,
  filesScanned: 18420,
  duplicateFiles: 1482,
  duplicateGroups: 346,
  recoverable: 14.8 * 1024 ** 3,
  recovered: 5.4 * 1024 ** 3,
  scannedSize: 312.4 * 1024 ** 3,
  storageBreakdown: [
    { name: 'Photos & RAW Media', value: 58, color: '#6366f1', bytes: 181.2 * 1024 ** 3 },
    { name: 'Office Documents & PDFs', value: 27, color: '#a855f7', bytes: 84.3 * 1024 ** 3 },
    { name: 'Code & Archives', value: 15, color: '#06b6d4', bytes: 46.9 * 1024 ** 3 },
  ],
  duplicateBreakdown: [
    { name: 'Exact Bit-for-Bit Hash', value: 34, color: '#3b82f6' },
    { name: 'Near-Duplicate Images', value: 38, color: '#6366f1' },
    { name: 'Cross-Format Documents', value: 18, color: '#a855f7' },
    { name: 'Semantic Revisions', value: 10, color: '#10b981' },
  ],
  recoveryByType: [
    { name: 'High-Res Photos', value: 8.9, color: '#6366f1', bytes: 8.9 * 1024 ** 3 },
    { name: 'Draft Documents', value: 3.8, color: '#a855f7', bytes: 3.8 * 1024 ** 3 },
    { name: 'Duplicate Downloads', value: 2.1, color: '#06b6d4', bytes: 2.1 * 1024 ** 3 },
  ],
}

export const demoGroups: DuplicateGroup[] = [
  {
    id: 'grp-amalfi-coast',
    title: 'Amalfi Coast Vacation Panorama',
    category: 'image',
    type: 'Near image',
    similarity: 97.6,
    recoverable: 12.8 * 1024 ** 2,
    confidence: 'Almost certain',
    explanation: '3 copies match the exact visual scene with perceptual hash Hamming distance ≤ 2. The master file has uncompressed 24MP Sony Alpha RAW resolution, while WhatsApp and web exports have downscaled dimensions and stripped EXIF data.',
    recommendationReason: 'Keep DSC09482_RAW.JPG: Highest 6000×4000 resolution, pristine dynamic range, and complete Sony α7 IV EXIF metadata preserved.',
    signals: [
      { label: 'pHash Hamming Distance', value: '2 / 64 (97% match)', score: 97 },
      { label: 'Deep Vision Embedding (CLIP)', value: '0.984 Cosine', score: 98 },
      { label: 'Resolution Divergence', value: '6000×4000 vs 1280×853 (-82%)', isWarning: true },
      { label: 'JPEG Compression Artifacts', value: 'Subsampling 4:2:0 detected in copy', isWarning: true },
      { label: 'Camera EXIF Sensor Match', value: 'Sony α7 IV · 24-70mm GM II', score: 100 }
    ],
    files: [
      {
        id: 'f-amalfi-1',
        name: 'DSC09482_Original_Master.jpg',
        path: '/Volumes/Storage/Photography/2025_Italy/DSC09482_Original_Master.jpg',
        type: 'image',
        extension: 'JPG',
        size: 14.2 * 1024 ** 2,
        modifiedAt: ago(12),
        dimensions: '6000 × 4000',
        megapixels: '24.0 MP',
        quality: 99,
        isRecommended: true,
        phash: 'd4e5f6a1b2c39870',
        sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=85',
        exif: {
          camera: 'Sony ILCE-7M4 (α7 IV)',
          lens: 'FE 24-70mm F2.8 GM II',
          iso: 'ISO 100',
          exposure: '1/500s · f/5.6',
          date: 'Aug 14, 2025 16:42:19',
          colorSpace: 'sRGB IEC61966-2.1'
        }
      },
      {
        id: 'f-amalfi-2',
        name: 'DSC09482_copy.jpg',
        path: '/Volumes/Storage/Downloads/DSC09482_copy.jpg',
        type: 'image',
        extension: 'JPG',
        size: 10.1 * 1024 ** 2,
        modifiedAt: ago(8),
        dimensions: '6000 × 4000',
        megapixels: '24.0 MP',
        quality: 91,
        phash: 'd4e5f6a1b2c39870',
        sha256: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
        imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=70',
        exif: {
          camera: 'Sony ILCE-7M4',
          lens: 'FE 24-70mm',
          iso: 'ISO 100',
          exposure: '1/500s · f/5.6',
          date: 'Aug 14, 2025 16:42:19'
        }
      },
      {
        id: 'f-amalfi-3',
        name: 'WhatsApp_Image_2025-08-15_at_18.22.jpg',
        path: '/Volumes/Storage/WhatsApp/Media/WhatsApp_Image_2025-08-15_at_18.22.jpg',
        type: 'image',
        extension: 'JPG',
        size: 1.4 * 1024 ** 2,
        modifiedAt: ago(7),
        dimensions: '1920 × 1280',
        megapixels: '2.5 MP',
        quality: 72,
        phash: 'd4e5f6a1b2c39872',
        sha256: '4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a',
        imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=500&q=50'
      },
      {
        id: 'f-amalfi-4',
        name: 'amalfi_story_thumb.jpg',
        path: '/Volumes/Storage/Social/amalfi_story_thumb.jpg',
        type: 'image',
        extension: 'JPG',
        size: 0.5 * 1024 ** 2,
        modifiedAt: ago(6),
        dimensions: '1080 × 720',
        megapixels: '0.8 MP',
        quality: 60,
        phash: 'd4e5f6a1b2c39873',
        sha256: '8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c',
        imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=400&q=40'
      }
    ]
  },
  {
    id: 'grp-ml-thesis',
    title: 'Research Proposal · Transformer Optimization',
    category: 'document',
    type: 'Near document',
    similarity: 94.2,
    recoverable: 8.6 * 1024 ** 2,
    confidence: 'Highly similar',
    explanation: 'Cross-format document match between Microsoft Word (.docx) source and compiled PDF export. The latest revision contains Section 4.2 Benchmark Analysis and 8 additional bibliographic citations.',
    recommendationReason: 'Keep Proposal_v3_Final_Reviewed.docx: Contains the full editable superset of text (18 pages, 6,420 words) with the latest supervisor revisions.',
    signals: [
      { label: 'Semantic Embedding (MiniLM)', value: '0.962 Cosine', score: 96 },
      { label: 'Normalized Text TF-IDF Overlap', value: '92.4% match', score: 92 },
      { label: 'Cross-Format Detection', value: 'DOCX ⟷ PDF match' },
      { label: 'Section Additions', value: '+3 paragraphs, +8 citations in v3' }
    ],
    diffData: {
      fileA: 'Proposal_v1_Draft.docx',
      fileB: 'Proposal_v3_Final_Reviewed.docx',
      wordOverlap: 93.8,
      addedLines: 14,
      removedLines: 4,
      segments: [
        { type: 'unchanged', text: '# Transformer Latency Optimization in Edge Environments\n\nAbstract: Transformer-based neural architectures have achieved state-of-the-art performance across computer vision and NLP tasks.' },
        { type: 'removed', text: '- However, memory bandwidth limitations on mobile devices make inference slow and power-hungry.' },
        { type: 'added', text: '+ However, memory bandwidth bottlenecks and quadratic self-attention complexity strictly limit real-time inference on edge accelerators (TPU / NPU).' },
        { type: 'unchanged', text: '\n## 1. Methodology & Quantization\nWe apply post-training INT8 weight-only quantization combined with FlashAttention kernel fusion.' },
        { type: 'added', text: '+ In addition, we implement 4-bit block-wise quantization with dynamic scale estimation, reducing VRAM consumption by 58.4% without degrading perplexity.' },
        { type: 'unchanged', text: '\n## 2. Experimental Results\nLatency was evaluated on an NVIDIA Jetson Orin Nano (8GB) across sequence lengths [128, 512, 2048].' },
        { type: 'added', text: '+ Table 1: End-to-end latency dropped from 142ms to 38.6ms per token batch (3.68x speedup).' }
      ]
    },
    files: [
      {
        id: 'f-doc-1',
        name: 'Proposal_v3_Final_Reviewed.docx',
        path: '/Users/ava/Documents/Thesis/Proposal_v3_Final_Reviewed.docx',
        type: 'document',
        extension: 'DOCX',
        size: 4.8 * 1024 ** 2,
        modifiedAt: ago(2, 4),
        pages: 18,
        quality: 98,
        isRecommended: true,
        previewText: '# Transformer Latency Optimization in Edge Environments\nAbstract: Transformer-based neural architectures have achieved state-of-the-art performance across computer vision and NLP tasks...'
      },
      {
        id: 'f-doc-2',
        name: 'Proposal_v2_Draft.docx',
        path: '/Users/ava/Documents/Thesis/Drafts/Proposal_v2_Draft.docx',
        type: 'document',
        extension: 'DOCX',
        size: 3.6 * 1024 ** 2,
        modifiedAt: ago(9),
        pages: 15,
        quality: 84,
        previewText: '# Transformer Latency Optimization in Edge Environments\nAbstract: Transformer-based neural architectures have achieved state-of-the-art performance...'
      },
      {
        id: 'f-doc-3',
        name: 'Proposal_Submission_Export.pdf',
        path: '/Users/ava/Desktop/Proposal_Submission_Export.pdf',
        type: 'document',
        extension: 'PDF',
        size: 5.2 * 1024 ** 2,
        modifiedAt: ago(2, 1),
        pages: 18,
        quality: 94,
        previewText: 'Transformer Latency Optimization in Edge Environments\nAbstract: Transformer-based neural architectures have achieved state-of-the-art...'
      }
    ]
  },
  {
    id: 'grp-financial-tax',
    title: 'Q4 Financial Audit & Tax Receipts',
    category: 'exact',
    type: 'Exact',
    similarity: 100,
    recoverable: 34.2 * 1024 ** 2,
    confidence: 'Exact duplicate',
    explanation: 'Byte-for-byte exact cryptographic match verified with SHA-256 (64-character hash matches identically). These files are redundant copies located across Downloads and Documents.',
    recommendationReason: 'Keep primary copy in /Documents/Finance/Q4_2025_Tax_Audit_Report.pdf and safely purge download cache copies.',
    signals: [
      { label: 'Cryptographic SHA-256', value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (Match)', score: 100 },
      { label: 'File Size Byte Match', value: '17,942,881 bytes identical' },
      { label: 'Instant Hash Cluster', value: 'Zero ML processing required' }
    ],
    files: [
      {
        id: 'f-tax-1',
        name: 'Q4_2025_Tax_Audit_Report.pdf',
        path: '/Users/ava/Documents/Finance/Q4_2025_Tax_Audit_Report.pdf',
        type: 'document',
        extension: 'PDF',
        size: 17.1 * 1024 ** 2,
        modifiedAt: ago(45),
        pages: 42,
        quality: 100,
        isRecommended: true,
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      },
      {
        id: 'f-tax-2',
        name: 'Q4_2025_Tax_Audit_Report (1).pdf',
        path: '/Users/ava/Downloads/Q4_2025_Tax_Audit_Report (1).pdf',
        type: 'document',
        extension: 'PDF',
        size: 17.1 * 1024 ** 2,
        modifiedAt: ago(30),
        pages: 42,
        quality: 100,
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      },
      {
        id: 'f-tax-3',
        name: 'Q4_2025_Tax_Audit_Report_copy.pdf',
        path: '/Users/ava/Downloads/Old/Q4_2025_Tax_Audit_Report_copy.pdf',
        type: 'document',
        extension: 'PDF',
        size: 17.1 * 1024 ** 2,
        modifiedAt: ago(25),
        pages: 42,
        quality: 100,
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      }
    ]
  },
  {
    id: 'grp-portrait-shoot',
    title: 'Studio Portrait · Cropped & Watermarked Social Cuts',
    category: 'image',
    type: 'Near image',
    similarity: 91.4,
    recoverable: 42.6 * 1024 ** 2,
    confidence: 'Highly similar',
    explanation: 'Near-duplicate portrait shoot. The original high-resolution studio master was cropped to 1:1 square for Instagram and 9:16 for Stories with added watermark text overlay.',
    recommendationReason: 'Keep Studio_Master_Raw.jpg: Full frame uncropped 50MP Canon EOS R5 master with 14-bit RAW color depth.',
    signals: [
      { label: 'Visual Embedding Similarity', value: '0.938 Cosine', score: 94 },
      { label: 'Aspect Ratio Crop Detected', value: '3:2 Full Frame ⟷ 1:1 Square Crop', isWarning: true },
      { label: 'Perceptual Hash Match', value: 'wHash Distance 4 (92%)', score: 92 },
      { label: 'Camera EXIF Metadata', value: 'Canon EOS R5 · 85mm f/1.2L', score: 100 }
    ],
    files: [
      {
        id: 'f-port-1',
        name: 'Studio_Master_Raw.jpg',
        path: '/Volumes/Work/Portraits/Studio_Master_Raw.jpg',
        type: 'image',
        extension: 'JPG',
        size: 38.4 * 1024 ** 2,
        modifiedAt: ago(18),
        dimensions: '8192 × 5464',
        megapixels: '44.8 MP',
        quality: 100,
        isRecommended: true,
        phash: 'ff88001122334455',
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
        exif: {
          camera: 'Canon EOS R5',
          lens: 'RF 85mm F1.2 L USM',
          iso: 'ISO 50',
          exposure: '1/200s · f/2.0',
          date: 'Jul 22, 2025 14:10:02'
        }
      },
      {
        id: 'f-port-2',
        name: 'Instagram_Square_1080.jpg',
        path: '/Volumes/Work/Social/Instagram_Square_1080.jpg',
        type: 'image',
        extension: 'JPG',
        size: 2.8 * 1024 ** 2,
        modifiedAt: ago(15),
        dimensions: '1080 × 1080',
        megapixels: '1.2 MP',
        quality: 74,
        phash: 'ff88001122334458',
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=70'
      },
      {
        id: 'f-port-3',
        name: 'Story_Cut_1080x1920.jpg',
        path: '/Volumes/Work/Social/Story_Cut_1080x1920.jpg',
        type: 'image',
        extension: 'JPG',
        size: 1.9 * 1024 ** 2,
        modifiedAt: ago(14),
        dimensions: '1080 × 1920',
        megapixels: '2.0 MP',
        quality: 68,
        phash: 'ff88001122334459',
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=60'
      }
    ]
  },
  {
    id: 'grp-contract-nda',
    title: 'Consulting NDA Agreement · Signed Revisions',
    category: 'document',
    type: 'Semantic match',
    similarity: 91.8,
    recoverable: 3.4 * 1024 ** 2,
    confidence: 'Highly similar',
    explanation: 'Semantically identical legal agreement with minor clause updates in Section 7 (Governing Law & Venue) and updated party signatories.',
    recommendationReason: 'Keep Non-Disclosure_Agreement_Final_Signed.pdf: Contains the countersigned digital certificate and verified execution date.',
    signals: [
      { label: 'Sentence-BERT Semantic Match', value: '0.942 Similarity', score: 94 },
      { label: 'Document Clause Structure', value: '9 out of 10 clauses identical' },
      { label: 'Signed Certificate Present', value: 'DocuSign verified timestamp', score: 100 }
    ],
    diffData: {
      fileA: 'NDA_Standard_Template.docx',
      fileB: 'Non-Disclosure_Agreement_Final_Signed.pdf',
      wordOverlap: 91.2,
      addedLines: 6,
      removedLines: 2,
      segments: [
        { type: 'unchanged', text: 'CONFIDENTIALITY AND NON-DISCLOSURE AGREEMENT\nThis Agreement is entered into on this 15th day of January, 2025 by and between:' },
        { type: 'removed', text: '- [CLIENT COMPANY NAME], a Delaware Corporation ("Disclosing Party")' },
        { type: 'added', text: '+ Horizon Data Technologies Inc., a Delaware Corporation ("Disclosing Party")' },
        { type: 'unchanged', text: '\n1. Definition of Confidential Information\n"Confidential Information" refers to any proprietary technical data, trade secrets, algorithm weights...' },
        { type: 'added', text: '+ 7. Governing Law: This Agreement shall be governed by the laws of the State of California without regard to conflict of laws principles.' }
      ]
    },
    files: [
      {
        id: 'f-nda-1',
        name: 'Non-Disclosure_Agreement_Final_Signed.pdf',
        path: '/Users/ava/Documents/Legal/Non-Disclosure_Agreement_Final_Signed.pdf',
        type: 'document',
        extension: 'PDF',
        size: 2.1 * 1024 ** 2,
        modifiedAt: ago(3),
        pages: 6,
        quality: 99,
        isRecommended: true,
        previewText: 'CONFIDENTIALITY AND NON-DISCLOSURE AGREEMENT\nThis Agreement is entered into on this 15th day of January, 2025 by and between Horizon Data Technologies Inc...'
      },
      {
        id: 'f-nda-2',
        name: 'NDA_Standard_Template.docx',
        path: '/Users/ava/Documents/Templates/NDA_Standard_Template.docx',
        type: 'document',
        extension: 'DOCX',
        size: 1.3 * 1024 ** 2,
        modifiedAt: ago(60),
        pages: 5,
        quality: 79,
        previewText: 'CONFIDENTIALITY AND NON-DISCLOSURE AGREEMENT\nThis Agreement is entered into on this [Date] by and between [CLIENT COMPANY NAME]...'
      }
    ]
  }
]

export const demoHistory: ScanRecord[] = [
  { id: 'scan-001', name: '/Users/ava/Pictures & Media', files: 12480, size: 218.4 * 1024 ** 3, groups: 214, recovered: 8.9 * 1024 ** 3, date: ago(1, 2), status: 'Completed', duration: '1m 24s' },
  { id: 'scan-002', name: '/Users/ava/Documents & Research', files: 4210, size: 48.6 * 1024 ** 3, groups: 88, recovered: 3.4 * 1024 ** 3, date: ago(3, 5), status: 'Completed', duration: '42s' },
  { id: 'scan-003', name: '/Volumes/External_Backup/2025_Archives', files: 1730, size: 45.4 * 1024 ** 3, groups: 44, recovered: 2.5 * 1024 ** 3, date: ago(14), status: 'Completed', duration: '36s' }
]

export const demoQuarantine: QuarantineItem[] = [
  {
    id: 'q-1',
    fileId: 'f-amalfi-3',
    name: 'WhatsApp_Image_2025-08-15_at_18.22.jpg',
    originalPath: '/Volumes/Storage/WhatsApp/Media/WhatsApp_Image_2025-08-15_at_18.22.jpg',
    quarantinePath: '.dedupeiq/quarantine/q-1_WhatsApp_Image.jpg',
    size: 1.4 * 1024 ** 2,
    type: 'image',
    extension: 'JPG',
    quarantinedAt: ago(1, 3),
    expiresAt: ago(-29),
    similarity: 97.6,
    groupTitle: 'Amalfi Coast Vacation Panorama'
  },
  {
    id: 'q-2',
    fileId: 'f-doc-2',
    name: 'Proposal_v2_Draft.docx',
    originalPath: '/Users/ava/Documents/Thesis/Drafts/Proposal_v2_Draft.docx',
    quarantinePath: '.dedupeiq/quarantine/q-2_Proposal_v2_Draft.docx',
    size: 3.6 * 1024 ** 2,
    type: 'document',
    extension: 'DOCX',
    quarantinedAt: ago(2, 5),
    expiresAt: ago(-28),
    similarity: 94.2,
    groupTitle: 'Research Proposal · Transformer Optimization'
  },
  {
    id: 'q-3',
    fileId: 'f-tax-2',
    name: 'Q4_2025_Tax_Audit_Report (1).pdf',
    originalPath: '/Users/ava/Downloads/Q4_2025_Tax_Audit_Report (1).pdf',
    quarantinePath: '.dedupeiq/quarantine/q-3_Tax_Audit.pdf',
    size: 17.1 * 1024 ** 2,
    type: 'document',
    extension: 'PDF',
    quarantinedAt: ago(4),
    expiresAt: ago(-26),
    similarity: 100,
    groupTitle: 'Q4 Financial Audit & Tax Receipts'
  }
]
