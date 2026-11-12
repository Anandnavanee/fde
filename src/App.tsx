import { useEffect, useMemo, useState } from "react";
import { initialCases } from "./data";
import type { CaseRecord, DocumentStatus, Page } from "./types";

const navItems = [
  { id: "queue", label: "All Institutional Cases", icon: "▣" },
  { id: "review", label: "KYC/AML Review", icon: "⬡" },
  { id: "pending", label: "Pending Client Chase", icon: "◉" },
  { id: "escalations", label: "Escalations", icon: "⚠" },
  { id: "archive", label: "Dispatched Archive", icon: "▤" },
] as const;

function App() {
  const [cases, setCases] = useState(initialCases);
  const [selectedCaseId, setSelectedCaseId] = useState("CS-9402");
  const [page, setPage] = useState<Page>("queue");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All Institutional Cases");
  const [rmFilter, setRmFilter] = useState("all");
  const [showAudit, setShowAudit] = useState(false);
  const [notice, setNotice] = useState("");
  const [reviewResolved, setReviewResolved] = useState(false);
  const [saved, setSaved] = useState(false);
  const [recipient, setRecipient] = useState(initialCases[0].recipientEmail ?? "");
  const [cc, setCc] = useState("rm.vance@apexbank.com; institutional.onboarding.audit@apexbank.com");
  const [subject, setSubject] = useState("ACTION REQUIRED: Outstanding Onboarding Documentation - Apex Global Logistics LLC");
  const [emailBody, setEmailBody] = useState(
    "Dear Treasury Team at Apex Global Logistics,\\n\\nWe hope this correspondence finds you well.\\n\\nIn connection with our ongoing onboarding review for Apex Global Logistics LLC (Case Ref CS-9402), our Institutional Compliance Committee has verified and safely archived your Certificate of Incorporation and relevant formation filings. We appreciate your prompt submission of those materials.\\n\\nTo finalize account provisioning, please provide the outstanding documents listed below through your secure upload portal.",
  );

  const selectedCase = cases.find((item) => item.id === selectedCaseId) ?? cases[0];
  useEffect(() => {
    const activeCase = cases.find((item) => item.id === selectedCaseId);
    if (!activeCase) return;
    setRecipient(activeCase.recipientEmail ?? `onboarding+${activeCase.id.toLowerCase()}@client.example`);
    setCc(`${activeCase.initials.toLowerCase()}.rm@apexbank.example; institutional.audit@apexbank.example`);
    setSubject(`ACTION REQUIRED: Outstanding Onboarding Documentation - ${activeCase.client}`);
    setEmailBody(`Dear Treasury Team at ${activeCase.client},\n\nWe hope this correspondence finds you well.\n\nIn connection with our ongoing onboarding review for ${activeCase.client} (Case Ref ${activeCase.id}), please provide the outstanding documents listed in your secure upload portal.\n\nRegards,\nInstitutional Onboarding Team`);
  }, [selectedCaseId]);
  const requiredDocuments = selectedCase.documents.filter((doc) => doc.required);
  const receivedCount = requiredDocuments.filter((doc) => doc.status === "Received").length;
  const unconfirmedCount = requiredDocuments.filter((doc) => doc.status === "Unconfirmed").length;
  const missingCount = requiredDocuments.filter((doc) => doc.status === "Missing").length;
  const filteredCases = useMemo(() => {
    const query = search.trim().toLowerCase();
    return cases.filter((item) => {
      const matchesSearch = !query || `${item.id} ${item.client} ${item.type} ${item.rm}`.toLowerCase().includes(query);
      const matchesFilter = activeFilter === "All Institutional Cases"
        || (activeFilter === "KYC/AML Review" && item.documents.some((doc) => doc.status === "Unconfirmed"))
        || (activeFilter === "Pending Client Chase" && item.documents.some((doc) => doc.status === "Missing"))
        || (activeFilter === "Escalations" && item.id === "CS-9402")
        || (activeFilter === "Dispatched Archive" && item.id === "CS-4100");
      const matchesRm = rmFilter === "all" || item.rm === rmFilter;
      return matchesSearch && matchesFilter && matchesRm;
    });
  }, [activeFilter, cases, rmFilter, search]);

  function updateDocument(documentId: string, status: DocumentStatus) {
    setCases((current) => current.map((item) => item.id !== selectedCase.id ? item : {
      ...item,
      activity: "Just now",
      documents: item.documents.map((doc) => doc.id === documentId
        ? { ...doc, status, source: status === "Received" ? "Manual verification" : doc.source, updated: status === "Received" ? new Date().toLocaleString() : doc.updated }
        : doc),
    }));
    setNotice(`${status === "Received" ? "Document marked received" : "Document status updated"} · ${selectedCase.id}`);
  }

  function openCase(item: CaseRecord, nextPage: Page = "tracker") {
    setSelectedCaseId(item.id);
    setPage(nextPage);
    setReviewResolved(false);
  }

  function navigate(nextPage: Page) {
    setPage(nextPage);
    setActiveFilter("All Institutional Cases");
  }

  function saveDraft() {
    setSaved(true);
    setNotice("Draft saved locally · no email was sent");
  }

  function dispatchChase() {
    if (!reviewResolved) {
      setNotice("Resolve the compliance review note before dispatch.");
      return;
    }
    setNotice("Demo dispatch recorded · no email was sent");
    setPage("tracker");
  }

  const allDocuments = selectedCase.documents;
  const chaseDocuments = allDocuments.filter((doc) => doc.required && doc.status === "Missing");

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => navigate("queue")} aria-label="Go to case queue">
          <span className="brand-mark">▤</span>
          <span className="brand-copy">
            <strong>Apex Institutional Ledger</strong>
            <small>RM Onboarding Document Chase Engine <span className="brand-divider">|</span> Desk ID: RM-NYC-084</small>
          </span>
        </button>
        <nav className="top-nav" aria-label="Primary navigation">
          <button className={page === "queue" ? "top-link active" : "top-link"} onClick={() => navigate("queue")}>Case Queue</button>
          <button className={page === "tracker" ? "top-link active" : "top-link"} onClick={() => navigate("tracker")}>Doc Tracker</button>
          <button className={page === "chase" ? "top-link active" : "top-link"} onClick={() => navigate("chase")}>Chase Engine</button>
          <button className="top-link" onClick={() => setShowAudit(true)}>Audit Trail</button>
        </nav>
        <div className="sync-status"><span className="live-dot" /> <span>Sync Status: Live<br /><small>(09:42 EST)</small></span><span className="sync-symbol">↻</span></div>
        <button className="button button-dark new-client" onClick={() => setNotice("New client onboarding is a demo-only workflow.")}>＋ <span>New Client<br />Onboarding</span></button>
        <div className="top-tools"><button aria-label="Notifications">♧</button><button aria-label="Help" onClick={() => setNotice("Demo workspace · sample data only.")}>ⓘ</button><button aria-label="Settings" onClick={() => setNotice("Settings are not available in this demo.")}>⚙</button></div>
        <div className="user-chip"><span className="avatar">SJ</span><span>Sarah Jenkins<small>RM-842</small></span></div>
      </header>

      <aside className="sidebar">
        <div className="desk-card"><span className="desk-icon">♙</span><div><strong>Corporate Ledger</strong><small>Desk ID: RM-NYC-084</small></div></div>
        <div className="sidebar-nav">
          {navItems.map((item, index) => (
            <button key={item.id} className={`side-link ${activeFilter === item.label ? "selected" : ""}`} onClick={() => {
              setActiveFilter(item.label === "Escalations" ? item.label : item.label);
              if (page !== "queue") setPage("queue");
            }}>
              <span className="side-icon">{item.icon}</span><span>{item.label}</span>
              {index === 0 && <span className="side-count">{cases.length}</span>}
              {index === 1 && <span className="side-count blue">{cases.reduce((count, entry) => count + entry.documents.filter((doc) => doc.status === "Unconfirmed").length, 0)}</span>}
              {index === 2 && <span className="side-count orange">{cases.filter((entry) => entry.documents.some((doc) => doc.status === "Missing")).length}</span>}
              {index === 3 && <span className="side-count red">1</span>}
            </button>
          ))}
        </div>
        <button className="quick-chase" onClick={() => navigate("chase")}><span>ϟ</span> Quick Chase (T-3) <b>→</b></button>
        <div className="sidebar-bottom">
          <button className="side-link"><span className="side-icon">⚒</span>Compliance Direct</button>
          <button className="side-link" onClick={() => setShowAudit(true)}><span className="side-icon">▤</span>Audit Logs</button>
          <div className="compliance-note">SEC Rule 17a-4 Compliant<br />Session · Demo environment</div>
        </div>
      </aside>

      <main className="main-content">
        {page === "queue" && (
          <QueuePage
            cases={filteredCases}
            totalCases={cases.length}
            activeFilter={activeFilter}
            search={search}
            setSearch={setSearch}
            setActiveFilter={setActiveFilter}
            rmFilter={rmFilter}
            setRmFilter={setRmFilter}
            openCase={openCase}
            setNotice={setNotice}
          />
        )}
        {page === "tracker" && (
          <TrackerPage
            item={selectedCase}
            docs={allDocuments}
            receivedCount={receivedCount}
            unconfirmedCount={unconfirmedCount}
            missingCount={missingCount}
            onStatus={updateDocument}
            onChase={() => navigate("chase")}
            onAudit={() => setShowAudit(true)}
            onQueue={() => navigate("queue")}
            setNotice={setNotice}
          />
        )}
        {page === "chase" && (
          <ChasePage
            item={selectedCase}
            documents={chaseDocuments}
            reviewResolved={reviewResolved}
            setReviewResolved={setReviewResolved}
            recipient={recipient}
            setRecipient={setRecipient}
            cc={cc}
            setCc={setCc}
            subject={subject}
            setSubject={setSubject}
            emailBody={emailBody}
            setEmailBody={setEmailBody}
            saved={saved}
            onSave={saveDraft}
            onDispatch={dispatchChase}
            onQueue={() => navigate("queue")}
            onTracker={() => navigate("tracker")}
          />
        )}
      </main>

      <footer className="demo-banner">DEMO WORKSPACE <span>·</span> Sample data only <span>·</span> Client email and document transfer are not connected</footer>

      {showAudit && <AuditModal item={selectedCase} onClose={() => setShowAudit(false)} />}
      {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss notification">×</button></div>}
    </div>
  );
}

interface QueuePageProps {
  cases: CaseRecord[];
  totalCases: number;
  activeFilter: string;
  search: string;
  setSearch: (value: string) => void;
  setActiveFilter: (value: string) => void;
  rmFilter: string;
  setRmFilter: (value: string) => void;
  openCase: (item: CaseRecord, page?: Page) => void;
  setNotice: (value: string) => void;
}

function QueuePage({ cases, totalCases, activeFilter, search, setSearch, setActiveFilter, rmFilter, setRmFilter, openCase, setNotice }: QueuePageProps) {
  const needsReview = cases.reduce((count, item) => count + item.documents.filter((doc) => doc.status === "Unconfirmed").length, 0);
  const pendingChase = cases.filter((item) => item.documents.some((doc) => doc.status === "Missing")).length;
  const [pageIndex, setPageIndex] = useState(1);
  useEffect(() => setPageIndex(1), [activeFilter, search]);
  const pageSize = 7;
  const pageCount = Math.max(1, Math.ceil(cases.length / pageSize));
  const visibleCases = cases.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);

  return (
    <>
      <section className="summary-grid">
        <SummaryCard label="Total Active Cases" value={String(totalCases)} hint="100% Desk Capacity" accent="navy" />
        <SummaryCard label="Needs Review" value={String(needsReview)} hint="Unconfirmed Items" accent="amber" />
        <SummaryCard label="Pending Client Chase" value={String(pendingChase)} hint="T-3 / T-7 Auto Queue" accent="blue" />
        <SummaryCard label="Closed (Archived)" value="28" hint="Audit Verified" accent="slate" />
      </section>

      <section className="queue-toolbar">
        <label className="search-field"><span>⌕</span><input value={search} onChange={(event) => { setSearch(event.target.value); setPageIndex(1); }} placeholder="Filter by Client Name or Case ID (e.g. CS-9402)" /></label>
        <select className="select-field" aria-label="Filter by relationship manager" value={rmFilter} onChange={(event) => setRmFilter(event.target.value)}>
          <option value="all">RM: All Relationship Managers</option>
          <option value="Sarah Jenkins">RM: Sarah Jenkins (RM-842)</option>
          <option value="Marcus Vance">RM: Marcus Vance (VP-NYC)</option>
        </select>
        <button className="button filter-button" onClick={() => setActiveFilter(activeFilter === "KYC/AML Review" ? "All Institutional Cases" : "KYC/AML Review")}>▽ Needs Review Filter: <u>{activeFilter === "KYC/AML Review" ? "Active" : "Off"}</u><span className="amber-dot" /></button>
        <button className="button" onClick={() => setNotice("CSV export prepared for this demo queue.")}>⇩ Export (.CSV)</button>
        <button className="button icon-button" aria-label="Table display options" onClick={() => setNotice("Table display options are fixed for this demo.")}>▥</button>
      </section>

      <section className="preview-toolbar">
        <span className="eyebrow">Preview UI States:</span>
        <button className="preview-pill selected-preview" onClick={() => setNotice("Showing the active live queue.")}>Active Live Queue</button>
        <button className="preview-pill" onClick={() => setNotice("Queue is up to date.")}>Loading Skeleton</button>
        <button className="preview-pill" onClick={() => setSearch("no matching clients")}>Empty State</button>
        <button className="preview-pill error-preview" onClick={() => setNotice("Sample system alert · queue data remains available.")}>System Error (08:15 EST)</button>
        <span className="sort-hint">Sorted by: <b>Priority / Unconfirmed Docs Top</b></span>
      </section>

      <section className="table-card">
        <div className="table-scroll">
          <table className="case-table">
            <thead><tr>
              <th className="check-col"><input type="checkbox" aria-label="Select all cases" /></th><th>Case ID</th><th>Client Legal Entity</th><th>Institutional Type</th><th>RM Assigned</th><th>Document Ledger Status</th><th>Last Activity</th><th>Action</th>
            </tr></thead>
            <tbody>
              {visibleCases.map((item) => {
                const received = item.documents.filter((doc) => doc.status === "Received").length;
                const unconfirmed = item.documents.filter((doc) => doc.status === "Unconfirmed").length;
                const missing = item.documents.filter((doc) => doc.status === "Missing").length;
                return (
                  <tr key={item.id} onClick={() => openCase(item)} className={item.id === "CS-4100" ? "archived-row" : ""}>
                    <td onClick={(event) => event.stopPropagation()}><input type="checkbox" aria-label={`Select ${item.id}`} /></td>
                    <td><span className={`priority-mark ${unconfirmed ? "warning" : ""}`}>{unconfirmed ? "●" : "·"}</span><strong className="mono">{item.id}</strong></td>
                    <td><strong>{item.client}</strong><span className="mobile-detail">{item.code}</span></td>
                    <td>{item.type}<span className="mobile-detail">{item.code}</span></td>
                    <td><span className="rm-chip">{item.initials}</span> {item.rm}</td>
                    <td className="status-cell"><StatusBadge status="Received" count={received} />{unconfirmed > 0 && <StatusBadge status="Unconfirmed" count={unconfirmed} />}{missing > 0 && <StatusBadge status="Missing" count={missing} />}</td>
                    <td className="mono activity">{item.activity}</td>
                    <td><button className="text-action" onClick={(event) => { event.stopPropagation(); openCase(item); }}>Open Case →</button></td>
                  </tr>
                );
              })}
              {visibleCases.length === 0 && <tr><td className="empty-row" colSpan={8}>No matching cases. Try another client name or case ID.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="table-footer"><span>Showing {cases.length === 0 ? 0 : (pageIndex - 1) * pageSize + 1} - {Math.min(pageIndex * pageSize, cases.length)} of {cases.length} institutional client records <span className="muted">| Sync latency: 28ms</span></span><div className="pagination"><button disabled={pageIndex === 1} onClick={() => setPageIndex((value) => Math.max(1, value - 1))}>Previous</button><span>{pageIndex}</span><button disabled={pageIndex >= pageCount} onClick={() => setPageIndex((value) => Math.min(pageCount, value + 1))}>Next</button></div></div>
      </section>

      <section className="assurance-grid">
        <AssuranceCard icon="▣" title="Zero-Duplicate Guarantee" text="Automated chase sequences never request already-received documents. Received files are recorded in the demo ledger." tone="green" />
        <AssuranceCard icon="↪" title="T-3 Chase Escalation Rule" text="Unconfirmed submissions trigger a review reminder before an RM-approved client follow-up." tone="amber" />
        <AssuranceCard icon="⌕" title="FINRA / SEC Form BD Match" text="Client entities are shown against sample registry details with an illustrative audit history." tone="blue" />
      </section>
    </>
  );
}

function SummaryCard({ label, value, hint, accent }: { label: string; value: string; hint: string; accent: string }) {
  return <div className={`summary-card ${accent}`}><span className="eyebrow">{label}</span><div><strong>{value}</strong><span>{hint}</span></div></div>;
}

function StatusBadge({ status, count }: { status: DocumentStatus; count: number }) {
  const icon = status === "Received" ? "✓" : status === "Unconfirmed" ? "△" : "◯";
  return <span className={`status-badge ${status.toLowerCase()}`}><span>{icon}</span>{count} {status}</span>;
}

function AssuranceCard({ icon, title, text, tone }: { icon: string; title: string; text: string; tone: string }) {
  return <article className="assurance-card"><span className={`assurance-icon ${tone}`}>{icon}</span><div><strong>{title}</strong><p>{text}</p></div></article>;
}

interface TrackerPageProps {
  item: CaseRecord;
  docs: CaseRecord["documents"];
  receivedCount: number;
  unconfirmedCount: number;
  missingCount: number;
  onStatus: (id: string, status: DocumentStatus) => void;
  onChase: () => void;
  onAudit: () => void;
  onQueue: () => void;
  setNotice: (value: string) => void;
}

function TrackerPage({ item, docs, receivedCount, unconfirmedCount, missingCount, onStatus, onChase, onAudit, onQueue, setNotice }: TrackerPageProps) {
  const totalRequired = docs.filter((doc) => doc.required).length;
  const complete = totalRequired ? Math.round((receivedCount / totalRequired) * 100) : 0;
  return (
    <>
      <div className="sync-alert"><span>⚠</span><strong>Case document system slow / sync failed at 09:15 EST. Showing cached evidence.</strong><code>FAIL_CODE: RETRY_LIMIT_EXCEEDED</code><button onClick={() => setNotice("Sync retry complete · demo data is current.")}>↻ Retry Sync</button><button aria-label="Dismiss sync message" onClick={(event) => event.currentTarget.parentElement?.remove()}>×</button></div>
      <div className="case-heading">
        <div className="breadcrumb"><button onClick={onQueue}>← Back to Case Queue</button><span>/</span><span className="eyebrow">Onboarding Ledger</span></div>
        <div className="case-heading-row"><div><h1>Case {item.id}: {item.client}</h1><span className="case-state"><i /> Active In-Progress</span><div className="case-meta"><span>Client Type: <b>{item.type}</b></span><span>RM Assigned: <b>{item.rm} ({item.initials}-842)</b></span><span>Jurisdiction: <b>{item.jurisdiction}</b></span><span>Target Go-Live: <b>2024-11-01</b></span></div></div>
          <div className="heading-actions"><button className="button" onClick={onAudit}>◉ Audit Trail <span className="mono">(14 entries)</span></button><button className="button button-dark" onClick={onChase}>▧ Draft Chase Email <span className="button-count">{missingCount} Missing, {unconfirmedCount} Unconfirmed</span></button></div>
        </div>
      </div>
      <div className="tracker-layout">
        <section className="tracker-main">
          <div className="completeness-card"><div className="completeness-heading"><span className="eyebrow">Package Completeness:</span><div className="progress"><span style={{ width: `${complete}%` }} /></div><strong>{receivedCount} / {totalRequired} Verified ({complete}%)</strong></div><div className="completeness-tags"><StatusBadge status="Received" count={receivedCount} /><StatusBadge status="Unconfirmed" count={unconfirmedCount} /><StatusBadge status="Missing" count={missingCount} /></div></div>
          <section className="document-panel">
            <div className="panel-heading"><div><span className="panel-icon">☷</span><h2>Mandatory &amp; Optional Documentation Assessment</h2></div><span className="eyebrow">Tier-1 Regulatory Schema: KYC-CORP-V4</span></div>
            <div className="doc-column-head"><span>Requirement Label &amp; Identifiers</span><span>Obligation</span><span>Verification Status</span></div>
            <div className="document-list">
              {docs.map((doc) => <DocumentRow key={doc.id} doc={doc} onStatus={onStatus} setNotice={setNotice} />)}
            </div>
          </section>
          <div className="ledger-note"><span>⬡</span> Bank Policy 84-B: Automated chase triggers suppress any document bearing a Verified Vault ingestion token within the prior 14 banking days.</div>
        </section>
        <ChaseSummary item={item} docs={docs} onChase={onChase} />
      </div>
    </>
  );
}

function DocumentRow({ doc, onStatus, setNotice }: { doc: CaseRecord["documents"][number]; onStatus: (id: string, status: DocumentStatus) => void; setNotice: (value: string) => void }) {
  return (
    <article className={`document-row ${doc.status.toLowerCase()}`}>
      <div className="doc-main"><span className={`doc-icon ${doc.status.toLowerCase()}`}>{doc.status === "Received" ? "▤" : doc.status === "Unconfirmed" ? "▧" : "▥"}</span><div><div className="doc-name">{doc.name} <code>[{doc.id}]</code>{!doc.required && <span className="optional-tag">OPTIONAL</span>}</div><p>{doc.description}</p></div></div>
      <div className="obligation"><span className="required-tag">{doc.required ? "REQUIRED" : "OPTIONAL"}</span></div>
      <div className="doc-status"><StatusBadge status={doc.status} count={1} />{doc.status === "Unconfirmed" && <button className="confirm-button" onClick={() => onStatus(doc.id, "Received")}>✓ Mark received</button>}{doc.status === "Missing" && <button className="confirm-button upload-button" onClick={() => setNotice(`Upload selected for ${doc.name} · file transfer is disabled in this demo.`)}>＋ Upload</button>}{doc.status === "Received" && <button className="link-button" onClick={() => setNotice(`Evidence preview · ${doc.reference ?? doc.id}`)}>View evidence →</button>}</div>
      {doc.source && <div className="doc-evidence"><span>♧</span> Source: {doc.source} <b>| Ref: {doc.reference}</b>{doc.updated && <span className="evidence-date">| Date: {doc.updated}</span>}<button onClick={() => setNotice(`Evidence preview · ${doc.reference ?? doc.id}`)}>View PDF ↗</button></div>}
    </article>
  );
}

function ChaseSummary({ item, docs, onChase }: { item: CaseRecord; docs: CaseRecord["documents"]; onChase: () => void }) {
  const chaseDocs = docs.filter((doc) => doc.status !== "Received");
  return (
    <aside className="chase-summary">
      <div className="chase-summary-head"><span>▧</span><h2>Client Chase Generator</h2><span className="auto-resolve">AUTO-RESOLVE<br />ON</span></div>
      <div className="chase-summary-body">
        <div className="contact-grid"><span>Recipient:</span><b>cfo@{item.client.toLowerCase().replaceAll(" ", "").replace("llc", "logistics.com")}</b><span>CC Entity:</span><b>treasury-onboard@tier1bank.com</b><span>Cadence Policy:</span><b>Standard Corporate (T-7, T-3, T-0)</b></div>
        <div className="eyebrow section-label">Chasing Payload Items ({chaseDocs.length})</div>
        <div className="payload-list">{chaseDocs.map((doc) => <div key={doc.id} className={`payload-item ${doc.status.toLowerCase()}`}><span>{doc.name}</span><StatusBadge status={doc.status} count={1} /></div>)}</div>
        <div className="eyebrow section-label">Subject Preview</div><div className="subject-preview">[URGENT] Document Update Required: {item.id}</div>
        <div className="eyebrow section-label">Formatted Chase Body</div><div className="body-preview">Dear Treasury Team,<br /><br />Our compliance review indicates outstanding filing and documents requiring formal re-affirmation for Case {item.id}.<br /><br />Please use your secure upload portal to submit the outstanding items.</div>
        <button className="button button-dark full-button" onClick={onChase}>Open Chase Composer →</button>
        <div className="summary-foot"><span>Next cadence: T-3 reminder</span><span>Draft only</span></div>
      </div>
    </aside>
  );
}

interface ChasePageProps {
  item: CaseRecord;
  documents: CaseRecord["documents"];
  reviewResolved: boolean;
  setReviewResolved: (value: boolean) => void;
  recipient: string;
  setRecipient: (value: string) => void;
  cc: string;
  setCc: (value: string) => void;
  subject: string;
  setSubject: (value: string) => void;
  emailBody: string;
  setEmailBody: (value: string) => void;
  saved: boolean;
  onSave: () => void;
  onDispatch: () => void;
  onQueue: () => void;
  onTracker: () => void;
}

function ChasePage(props: ChasePageProps) {
  const { item, documents, reviewResolved, setReviewResolved, recipient, setRecipient, cc, setCc, subject, setSubject, emailBody, setEmailBody, saved, onSave, onDispatch, onQueue, onTracker } = props;
  return (
    <div className="chase-page">
      <section className="chase-context">
        <div className="breadcrumb"><button onClick={onQueue}>← Back to Case Queue</button><span>/</span><button onClick={onTracker}>Case: {item.id}</button></div>
        <div className="context-label eyebrow">Tier-1 Commercial Institutional Onboarding</div><div className="context-jurisdiction">Entity Jurisdiction: {item.jurisdiction}</div>
        <div className="entity-block"><h1>{item.client}</h1><span className="case-state"><i /> Active Pipeline</span><span className="chase-cadence">T-3 Chase Pending</span></div>
        <p className="entity-description">Entity Legal Structure: Multi-Member Corporate LLC · Target Facility: $45,000,000<br />Working Capital Revolver · Primary RM: {item.rm}</p>
        <div className="target-doc-heading"><strong>Target Chase Documents ({documents.length} items requiring client dispatch):</strong><span>Target Deadline: 28 Oct 2024 (17:00 EST)</span></div>
        <div className="target-doc-list">{documents.map((doc) => <div key={doc.id} className={`target-doc ${doc.status.toLowerCase()}`}><span>▧</span><code>[{doc.id}]</code><strong>{doc.name}</strong><StatusBadge status={doc.status} count={1} /></div>)}</div>
        <section className="held-documents"><div><h2>Held Back Documents Ledger (Zero-Duplicate Guarantee)</h2><span>System Audit Filter: 3 documents excluded from automated chase request</span></div><table><thead><tr><th>Doc Code</th><th>Requirement Name</th><th>Audit Exclusion Reason</th></tr></thead><tbody><tr><td>CERT_INCORP</td><td>Certificate of Incorporation</td><td>✓ Received in Case System<br /><small>Ref: DOC-88219-VAULT</small></td></tr><tr><td>W8_BEN_E</td><td>W-8BEN-E Tax Form</td><td>◉ Client correspondence to confirm</td></tr><tr><td>UBO_SCHED_B</td><td>UBO Schedule B</td><td>Optional document · threshold &lt; 25%</td></tr></tbody></table><p>⬡ Bank Policy 84-B: Automated chase triggers suppress any document bearing a Verified Vault ingestion token within the prior 14 banking days.</p></section>
      </section>
      <section className="composer">
        <header className="composer-header"><div><span>✉</span><div><h2>Outbound Chase Dispatcher</h2><small>Protocol: Institutional Secure Direct Relay</small></div></div><span className="cadence-badge">CADENCE: T-3 REMINDER</span></header>
        <div className="composer-form">
          <section className={`blocking-note ${reviewResolved ? "resolved" : ""}`}><div className="blocking-title"><span>⚠</span><strong>{reviewResolved ? "Review item acknowledged" : "Blocking review items (1 unresolved note):"}</strong><span className="hard-gate">HARD GATE</span></div><blockquote>• Note 1: “Client sent unencrypted signatory list on Oct 19 via personal email — verify signatory authenticity against passport scan prior to chase dispatch.”</blockquote><label className="resolve-check"><input type="checkbox" checked={reviewResolved} onChange={(event) => setReviewResolved(event.target.checked)} /><span>{reviewResolved ? "Review note acknowledged" : "Resolve & Acknowledge Note"}</span><em>Officer sign-off required</em></label><p>{reviewResolved ? "Acknowledgment recorded for this demo session." : "Send button is locked and disabled until all RM review notes are resolved."}</p></section>
          <div className="form-field"><label htmlFor="recipients">To Recipient(s): <small>Corporate Entity Officers</small></label><input id="recipients" value={recipient} onChange={(event) => setRecipient(event.target.value)} /></div>
          <div className="form-field"><label htmlFor="cc">CC / Compliance Archive: <small>Audit Archiving Node</small></label><input id="cc" value={cc} onChange={(event) => setCc(event.target.value)} /></div>
          <div className="form-field"><label htmlFor="subject">Subject Line:</label><input id="subject" value={subject} onChange={(event) => setSubject(event.target.value)} /></div>
          <div className="form-field body-field"><label htmlFor="email-body">Email Draft Body (Bank Standard): <button className="link-button" onClick={() => setEmailBody(`Dear Treasury Team at ${item.client},\\n\\nWe are following up on your institutional onboarding documentation for Case Ref ${item.id}. Please submit the outstanding items using your secure upload portal.\\n\\nRegards,\\nInstitutional Onboarding Team`)}>Revert to Master Template</button></label><div className="editor-toolbar"><button aria-label="Bold">B</button><button aria-label="Italic"><i>I</i></button><button aria-label="List">☷</button><span /> <button aria-label="Insert link">↗</button><span className="editor-filter">Auto-Filtered: Missing Items Only</span></div><textarea id="email-body" value={emailBody} onChange={(event) => setEmailBody(event.target.value)} /></div>
          <div className="secure-token">⬡ <span>One-Time Secure Upload Token: <b>#$TR-{item.id}-EXP72H</b></span><strong>Valid (72h Expiry)</strong></div>
        </div>
        <footer className="composer-footer"><span>{saved ? "Draft auto-saved just now" : "Draft not yet saved"}</span><div><button className="button" onClick={onSave}>▣ Save Draft</button><button className="button button-dark" disabled={!reviewResolved} onClick={onDispatch}>{reviewResolved ? "➤ Simulate Dispatch" : "♙ Send Chase Email"}</button></div></footer>
      </section>
    </div>
  );
}

function AuditModal({ item, onClose }: { item: CaseRecord; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="audit-modal" role="dialog" aria-modal="true" aria-labelledby="audit-title">
        <header><div><span className="modal-icon">◉</span><div><h2 id="audit-title">Audit Trail</h2><p>{item.id} · {item.client}</p></div></div><button onClick={onClose} aria-label="Close audit trail">×</button></header>
        <div className="audit-list"><AuditEntry time="09:12 EST" title="Certificate of Incorporation verified" detail="Document vault · DOC-88219-VAULT" tone="green" /><AuditEntry time="Yesterday · 16:40 EST" title="W-8BEN-E received for confirmation" detail="Client correspondence · analyst review required" tone="amber" /><AuditEntry time="Oct 18 · 14:22 EST" title="Client follow-up draft prepared" detail="T-3 reminder · draft only, not dispatched" tone="blue" /><AuditEntry time="Oct 14 · 09:12 EST" title="Onboarding case created" detail="Relationship Manager: Sarah Jenkins" tone="slate" /></div>
        <footer><span>Illustrative audit events · local demo data</span><button className="button" onClick={onClose}>Close</button></footer>
      </section>
    </div>
  );
}

function AuditEntry({ time, title, detail, tone }: { time: string; title: string; detail: string; tone: string }) {
  return <div className="audit-entry"><span className={`audit-point ${tone}`} /><div><span className="audit-time">{time}</span><strong>{title}</strong><p>{detail}</p></div></div>;
}

export default App;
