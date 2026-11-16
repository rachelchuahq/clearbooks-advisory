/**
 * ClearBooks Advisory Shared Client-Side Interactivity
 * - Conditional Popover API polyfill
 * - Native <dialog> light-dismiss fallback (closedby="any")
 * - Site-wide Quick Search modal
 * - Form validation (on blur + submit, clear on input)
 * - Real downloadable compliance artifacts (.ics, .csv, .txt)
 */
(function () {
  'use strict';

  // 1. Conditionally load Popover polyfill only when native support is missing
  if (!Object.hasOwn(HTMLElement.prototype, 'popover')) {
    const s = document.createElement('script');
    s.type = 'module';
    s.src = 'https://unpkg.com/@oddbird/popover-polyfill@latest/dist/popover.min.js';
    document.head.appendChild(s);
  }

  // 2. Fallback for dialog[closedby="any"] in browsers lacking closedBy (e.g. Safari)
  function initDialogLightDismiss() {
    if ('closedBy' in HTMLDialogElement.prototype) return;
    const outside = (e, dialog) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
      let pressedOutside = false;
      dialog.addEventListener('pointerdown', (e) => {
        pressedOutside = outside(e, dialog);
      });
      dialog.addEventListener('pointerup', (e) => {
        if (pressedOutside && outside(e, dialog)) dialog.close();
      });
    }
  }

  // 3. Toast helper (accessible live region)
  function showToast(message) {
    let existing = document.getElementById('cb-toast-region');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'cb-toast-region';
    toast.className = 'cb-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px;color:#b7c4ff" aria-hidden="true">check_circle</span><span></span>`;
    toast.querySelector('span:last-child').textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4500);
  }
  window.cbShowToast = showToast;

  // 4. Real file download helpers
  function triggerDownload(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(`Downloaded ${filename}`);
  }

  window.cbDownloadBirCalendar = function () {
    const text = [
      'CLEARBOOKS CO. — 2025 PHILIPPINE BIR STATUTORY TAX CALENDAR',
      'Accredited Philippine Accounting & Tax Compliance (PRC / BIR / SEC)',
      '==================================================================',
      '',
      'MONTHLY DEADLINES (eFPS / eBIRForms):',
      '- 10th of Month: BIR Form 1601-C (Withholding Tax on Compensation), 0619-E / 0619-F',
      '- 15th of Month: SSS, PhilHealth, Pag-IBIG Mandatory Employer Remittances',
      '- 20th of Month: BIR Form 2550M (Monthly VAT - if applicable)',
      '- 25th of Following Month after Quarter: BIR Form 2550Q (Quarterly VAT) / 2551Q (Percentage Tax)',
      '',
      'QUARTERLY INCOME TAX:',
      '- Q1: May 15 (1701Q Individual / 1702Q Corporate)',
      '- Q2: August 15 (1701Q / 1702Q)',
      '- Q3: November 15 (1701Q / 1702Q)',
      '',
      'ANNUAL STATUTORY FILINGS:',
      '- Jan 31: BIR Form 1604-C, 1604-F, Alphalist & Form 2316 Distribution',
      '- Apr 15: Annual Income Tax Return (1701 / 1701A / 1702-RT / 1702-EX) & eAFS Submission',
      '- Apr 30 - May 30: SEC Audited Financial Statements (AFS) & General Information Sheet (GIS)',
      '',
      'Need automated deadline tracking? Visit https://clearbooks.ph or book at contact.html'
    ].join('\n');
    triggerDownload('2025-BIR-Statutory-Calendar-Wallchart.txt', text, 'text/plain;charset=utf-8');
  };

  window.cbDownloadIcsCalendar = function () {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ClearBooks Advisory//BIR Compliance Calendar//EN',
      'BEGIN:VEVENT',
      'UID:bir-1601c-monthly@clearbooks.ph',
      'DTSTAMP:20250101T000000Z',
      'DTSTART;VALUE=DATE:20250110',
      'RRULE:FREQ=MONTHLY;BYMONTHDAY=10',
      'SUMMARY:BIR Form 1601-C & 0619-E Deadline (ClearBooks Advisory)',
      'DESCRIPTION:Monthly Withholding Tax on Compensation & Expanded Withholding Tax remittance.',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:bir-2550q-quarterly@clearbooks.ph',
      'DTSTAMP:20250101T000000Z',
      'DTSTART;VALUE=DATE:20250425',
      'RRULE:FREQ=MONTHLY;INTERVAL=3;BYMONTHDAY=25',
      'SUMMARY:BIR Form 2550Q / 2551Q Quarterly Filing (ClearBooks Advisory)',
      'DESCRIPTION:Quarterly VAT or Percentage Tax filing deadline.',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'UID:bir-aitr-annual@clearbooks.ph',
      'DTSTAMP:20250101T000000Z',
      'DTSTART;VALUE=DATE:20250415',
      'SUMMARY:Annual Income Tax Return (1701/1702) Deadline (ClearBooks Advisory)',
      'DESCRIPTION:Annual ITR filing and eAFS attachment deadline.',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    triggerDownload('ClearBooks-BIR-Deadlines-Sync.ics', ics, 'text/calendar;charset=utf-8');
  };

  window.cbDownloadAuditChecklist = function () {
    const csv = [
      'Category,Requirement,BIR/SEC Form,Frequency,Standard Penalty Risk',
      'Income Tax,Annual Income Tax Return,1701 / 1701A / 1702-RT,Annual (Apr 15),25% Surcharge + 12% Interest p.a.',
      'Income Tax,Quarterly Income Tax Return,1701Q / 1702Q,Quarterly,25% Surcharge + Compromise',
      'VAT / Percentage,Quarterly VAT or Percentage Tax,2550Q / 2551Q,Quarterly (25th),25% Surcharge + 12% Interest',
      'Withholding,Compensation Withholding Tax,1601-C,Monthly (10th),25% Surcharge per late month',
      'Withholding,Expanded Withholding Tax,0619-E / 1601-EQ,Monthly / Quarterly,Disallowance of Expenses',
      'Withholding,Certificate of Creditable Tax Withheld,2307,Quarterly / Per Payment,Loss of Tax Credits',
      'Corporate SEC,General Information Sheet,GIS via eFAST,Annual (30 days post-ASM),PHP 5000 - 20000+ late fine',
      'Corporate SEC,Audited Financial Statements,AFS via eFAST,Annual (per SEC schedule),PHP 10000+ & Revocation risk'
    ].join('\n');
    triggerDownload('2025-Corporate-Tax-Audit-Checklist.csv', csv, 'text/csv;charset=utf-8');
  };

  window.cbDownloadSlaProtocol = function () {
    const text = [
      'CLEARBOOKS CO. — 14-DAY CLIENT ONBOARDING SLA PROTOCOL',
      '=======================================================',
      '',
      'Step 01 (Day 1): Initial Diagnostic & Entity Discovery',
      '  - Review BIR COR (Form 2303), SEC Articles/GIS, and prior 12-month returns.',
      '  - Identify open cases, unfiled returns, or missing Books of Accounts.',
      '',
      'Step 02 (Days 2-3): Encrypted Vault & Ledger Architecture',
      '  - Provision RA 10173-compliant document vault & digital receipt pipeline.',
      '  - Map Chart of Accounts to Philippine Financial Reporting Standards (PFRS).',
      '',
      'Step 03 (Days 4-5): Historical Cleanup & Tax Reconciliation',
      '  - Reconcile Form 2307 tax credits, SLSP/SAWT schedules, and bank statements.',
      '  - Configure eFPS / eBIRForms automated filing calendar.',
      '',
      'Step 04 (Days 6-14): Live Parallel Run & Dedicated CPA Handover',
      '  - First monthly/quarterly statutory filings verified by Senior CPA Reviewer.',
      '  - 48-Hour SLA active for all tax inquiries and regulatory correspondence.'
    ].join('\n');
    triggerDownload('ClearBooks-Onboarding-SLA-Protocol.txt', text, 'text/plain;charset=utf-8');
  };

  // 5. Accessible form validation helper
  function initFormValidation() {
    document.querySelectorAll('form[data-cb-validate]').forEach((form) => {
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach((field) => {
        field.addEventListener('blur', () => {
          if (field.value.trim() !== '' || field.dataset.touched === 'true') {
            field.setAttribute('aria-invalid', String(!field.checkValidity()));
          }
        });
        field.addEventListener('input', () => {
          field.dataset.touched = 'true';
          field.setCustomValidity('');
          if (field.checkValidity()) {
            field.removeAttribute('aria-invalid');
          }
        });
      });
    });
  }

  // 6. Site-wide Quick Search Modal
  const SEARCH_INDEX = [
    { title: 'Home — Packages & Consultation', url: 'index.html', desc: 'Freelancer, SMB, and Corporate bookkeeping packages starting at ₱2,500/mo.' },
    { title: 'BIR Compliance Guide 2025', url: 'bir-compliance-guide.html', desc: 'Statutory tax calendar, Form 1701Q, 2551Q, 2550Q, 1601-C, 2307 & Audit Shield.' },
    { title: 'Corporate & SME Compliance', url: 'corporate-compliance.html', desc: 'Dedicated CPA controllers, eFPS management, LOA defense & compliance checklist.' },
    { title: 'How We Do Business (14-Day Methodology)', url: 'how-we-do-business.html', desc: '4-step client onboarding, SLA protocol, and interactive methodology.' },
    { title: 'SEC Statutory Disclosures (GIS & AFS)', url: 'sec-disclosures.html', desc: 'SEC eFAST, General Information Sheet, Audited Financial Statements & MC 28-2020.' },
    { title: 'eFPS Step-by-Step Portal Guide', url: 'efps-portal-guide.html', desc: 'Electronic Filing and Payment System enrollment, AAB banking & eAFS.' },
    { title: 'CPA Accreditation Credentials', url: 'cpa-credentials.html', desc: 'PRC Board of Accountancy, BIR Accreditation & SEC External Auditor standards.' },
    { title: 'Contact Support & Book Consultation', url: 'contact.html', desc: 'Schedule a free 15-min diagnostic or message our Makati/BGC CPA team.' },
    { title: 'Privacy Policy & RA 10173 Compliance', url: 'privacy-policy.html', desc: 'Data Privacy Act of 2012 safeguards, encryption & DPO contact.' },
    { title: 'Terms of Service', url: 'terms-of-service.html', desc: 'ClearBooks Advisory engagement terms, 48-hour SLA & accuracy guarantee.' },
    { title: 'Security & Ledger Integrity', url: 'security.html', desc: 'AES-256 encryption, role-based access & audit trail architecture.' }
  ];

  function ensureSearchDialog() {
    let dialog = document.getElementById('cb-search-dialog');
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.id = 'cb-search-dialog';
    dialog.setAttribute('closedby', 'any');
    dialog.setAttribute('aria-labelledby', 'cb-search-title');
    dialog.className = 'w-full max-w-xl rounded-xl border border-outline-variant bg-white p-0 shadow-2xl text-on-surface';
    dialog.innerHTML = `
      <div class="p-4 border-b border-outline-variant/40 flex items-center justify-between gap-3 bg-surface-container-low">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-secondary" aria-hidden="true">search</span>
          <h2 id="cb-search-title" class="font-bold text-primary text-base">Search ClearBooks Advisory</h2>
        </div>
        <button type="button" id="cb-search-close" class="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant" aria-label="Close search">
          <span class="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
      </div>
      <div class="p-4 space-y-3">
        <label for="cb-search-input" class="sr-only">Search pages, BIR forms, or compliance topics</label>
        <input id="cb-search-input" type="search" autofocus placeholder="Search BIR forms (1701Q, 2307), SEC, eFPS, packages..." class="w-full rounded-lg border border-outline-variant px-3.5 py-2.5 text-sm focus:border-secondary focus:ring-2 focus:ring-secondary/20">
        <ul id="cb-search-results" class="divide-y divide-outline-variant/30 max-h-80 overflow-y-auto"></ul>
      </div>
    `;
    document.body.appendChild(dialog);

    const input = dialog.querySelector('#cb-search-input');
    const results = dialog.querySelector('#cb-search-results');
    const closeBtn = dialog.querySelector('#cb-search-close');

    function render(query) {
      const q = (query || '').trim().toLowerCase();
      const matches = q
        ? SEARCH_INDEX.filter((item) => item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q))
        : SEARCH_INDEX.slice(0, 6);
      if (matches.length === 0) {
        results.innerHTML = `<li class="py-6 text-center text-sm text-on-surface-variant">No matching guides found. Try <a href="contact.html" class="text-secondary font-semibold underline">contacting a CPA</a>.</li>`;
        return;
      }
      results.innerHTML = matches
        .map(
          (m) => `
          <li>
            <a href="${m.url}" class="block py-3 px-2 rounded-lg hover:bg-surface-container-low transition-colors">
              <div class="font-semibold text-sm text-primary">${m.title}</div>
              <div class="text-xs text-on-surface-variant mt-0.5">${m.desc}</div>
            </a>
          </li>`
        )
        .join('');
    }

    input.addEventListener('input', () => render(input.value));
    closeBtn.addEventListener('click', () => dialog.close());
    render('');
    return dialog;
  }

  function initSearchTriggers() {
    document.querySelectorAll('[data-open-search]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const d = ensureSearchDialog();
        d.showModal();
        d.querySelector('#cb-search-input')?.focus();
      });
    });
  }

  // 7. Highlight current page in nav
  function markCurrentPage() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('header nav a[href], #mobile-nav-menu a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensureSearchDialog();
    initDialogLightDismiss();
    initFormValidation();
    initSearchTriggers();
    markCurrentPage();
  });
})();
