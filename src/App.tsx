import { useEffect, useMemo, useState } from "react";
import { initialCases } from "./data";
import type { CaseRecord, DocumentStatus, Page } from "./types";

const navItems = [
  { id: "queue", label: "All cases", icon: "▣" },
  { id: "review", label: "Needs review", icon: "⬡" },
  { id: "pending", label: "Waiting on client", icon: "◉" },
] as const;

function App() {
  const [cases, setCases] = useState(initialCases);
  const [selectedCaseId, setSelectedCaseId] = useState("CS-9402");
  const [page, setPage] = useState<Page>("queue");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All cases");
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
      const matchesFilter = activeFilter === "All cases"
        || (activeFilter === "Needs review" && item.documents.some((doc) => doc.status === "Unconfirmed"))
        || (activeFilter === "Waiting on client" && item.documents.some((doc) => doc.status === "Missing"));
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
    setActiveFilter("All cases");
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
        <div className="user-chip"><span className="avatar">SJ</span><span>Sarah Jenkins<small>RM-842</small></span></div>
      </header>

      <aside className="sidebar">
        <div className="desk-card"><span className="desk-icon">♙</span><div><strong>Corporate Ledger</strong><small>Desk ID: RM-NYC-084</small></div></div>
        <div className="sidebar-nav">
          {navItems.map((item, index) => (
            <button key={item.id} className={`side-link ${activeFilter === item.label ? "selected" : ""}`} onClick={() => {
              setActiveFilter(item.label);
              if (page !== "queue") setPage("queue");
            }}>
              <span className="side-icon">{item.icon}</span><span>{item.label}</span>
              {index === 0 && <span className="side-count">{cases.length}</span>}
              {index === 1 && <span className="side-count blue">{cases.filter((entry) => entry.documents.some((doc) => doc.status === "Unconfirmed")).length}</span>}
              {index === 2 && <span className="side-count orange">{cases.filter((entry) => entry.documents.some((doc) => doc.status === "Missing")).length}</span>}
            </button>
          ))}
        </div>
        <div className="sidebar-bottom">
          <button className="side-link" onClick={() => setShowAudit(true)}><span className="side-icon">▤</span>Activity history</button>
          <div className="compliance-note">Sample workspace<br />Changes are not saved</div>
        </div>
      </aside>

      <main className="main-content">
        {page === "queue" && (
          <QueuePage
            cases={filteredCases}
            activeFilter={activeFilter}
            search={search}
            setSearch={setSearch}
            setActiveFilter={setActiveFilter}
            rmFilter={rmFilter}
            setRmFilter={setRmFilter}
            openCase={openCase}
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
  activeFilter: string;
  search: string;
  setSearch: (value: string) => void;
  setActiveFilter: (value: string) => void;
  rmFilter: string;
  setRmFilter: (value: string) => void;
  openCase: (item: CaseRecord, page?: Page) => void;
}

function QueuePage({ cases, activeFilter, search, setSearch, setActiveFilter, rmFilter, setRmFilter, openCase }: QueuePageProps) {
  const [pageIndex, setPageIndex] = useState(1);
  useEffect(() => setPageIndex(1), [activeFilter, rmFilter, search]);
  const pageSize = 7;
  const pageCount = Math.max(1, Math.ceil(cases.length / pageSize));
  const visibleCases = cases.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
  const actionCases = cases.filter((item) => item.documents.some((doc) => doc.status === "Missing" || doc.status === "Unconfirmed")).length;

  return (
    <>
      <section className="queue-intro">
        <div><p className="eyebrow">Onboarding workspace</p><h1>Your cases</h1><p className="plain-language">Review documents and follow up with clients from one place.</p></div>
        <div className="action-summary"><strong>{actionCases}</strong><span>cases need your attention</span></div>
      </section>

      <section className="queue-toolbar">
        <label className="search-field"><span aria-hidden="true">⌕</span><input aria-label="Search by client or case ID" value={search} onChange={(event) => { setSearch(event.target.value); setPageIndex(1); }} placeholder="Search by client or case ID" /></label>
        <button className={`button filter-button ${activeFilter === "Waiting on client" ? "filter-active" : ""}`} onClick={() => setActiveFilter(activeFilter === "Waiting on client" ? "All cases" : "Waiting on client")}>{activeFilter === "Waiting on client" ? "Show all cases" : "Show cases waiting on client"}</button>
        <details className="advanced-filters">
          <summary>More filters</summary>
          <div className="filter-popover">
            <label htmlFor="review-filter">Document status</label>
            <select id="review-filter" value={activeFilter === "Needs review" ? "Needs review" : activeFilter === "Waiting on client" ? "Waiting on client" : "All cases"} onChange={(event) => setActiveFilter(event.target.value)}>
              <option value="All cases">All cases</option>
              <option value="Needs review">Needs review</option>
              <option value="Waiting on client">Waiting on client</option>
            </select>
            <label htmlFor="rm-filter">Relationship manager</label>
            <select id="rm-filter" aria-label="Filter by relationship manager" value={rmFilter} onChange={(event) => setRmFilter(event.target.value)}>
              <option value="all">All managers</option>
              <option value="Sarah Jenkins">Sarah Jenkins</option>
              <option value="Marcus Vance">Marcus Vance</option>
            </select>
          </div>
        </details>
      </section>

      <section className="table-card">
        <div className="table-scroll">
          <table className="case-table">
            <thead><tr>
              <th>Case</th><th>Document status</th><th>Updated</th><th>Action</th>
            </tr></thead>
            <tbody>
              {visibleCases.map((item) => {
                const unconfirmed = item.documents.filter((doc) => doc.status === "Unconfirmed").length;
                const missing = item.documents.filter((doc) => doc.status === "Missing").length;
                return (
                  <CaseQueueRow key={item.id} item={item} unconfirmed={unconfirmed} missing={missing} openCase={openCase} />
                );
              })}
              {visibleCases.length === 0 && <tr><td className="empty-row" colSpan={4}>No cases match that search. Try another client name or case ID.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="table-footer"><span>{cases.length} {cases.length === 1 ? "case" : "cases"}{activeFilter !== "All cases" ? ` · ${activeFilter.toLowerCase()}` : ""}</span><div className="pagination"><button disabled={pageIndex === 1} onClick={() => setPageIndex((value) => Math.max(1, value - 1))}>Previous</button><span>{pageIndex} of {pageCount}</span><button disabled={pageIndex >= pageCount} onClick={() => setPageIndex((value) => Math.min(pageCount, value + 1))}>Next</button></div></div>
      </section>
    </>
  );
}

function CaseQueueRow({ item, unconfirmed, missing, openCase }: { item: CaseRecord; unconfirmed: number; missing: number; openCase: (item: CaseRecord) => void }) {
  const needsAttention = missing > 0 || unconfirmed > 0;
  const summary = missing > 0
    ? `${missing} document${missing === 1 ? "" : "s"} missing`
    : unconfirmed > 0
      ? `${unconfirmed} document${unconfirmed === 1 ? "" : "s"} to review`
      : "All required documents received";
  return (
    <>
      <tr className="desktop-case-row" onClick={() => openCase(item)}>
        <td><strong>{item.client}</strong><span className="case-id mono">{item.id}</span></td>
        <td><span className={`case-action-label ${needsAttention ? "needs-action" : "complete"}`}>{summary}</span></td>
        <td className="activity">{item.activity}</td>
        <td><button className="text-action" onClick={(event) => { event.stopPropagation(); openCase(item); }}>Open case →</button></td>
      </tr>
      <tr className="mobile-case-row"><td colSpan={4}>
        <article className="mobile-case-card">
          <div className="mobile-case-top"><strong>{item.client}</strong><span className="mono">{item.id}</span></div>
          <span className={`case-action-label ${needsAttention ? "needs-action" : "complete"}`}>{summary}</span>
          <div className="mobile-case-bottom"><span>Updated {item.activity}</span><button className="button" onClick={() => openCase(item)}>Open case</button></div>
        </article>
      </td></tr>
    </>
  );
}

function StatusBadge({ status, count }: { status: DocumentStatus; count?: number }) {
  const icon = status === "Received" ? "✓" : status === "Unconfirmed" ? "△" : "◯";
  const label = status === "Unconfirmed" ? "Needs review" : status;
  return <span className={`status-badge ${status.toLowerCase()}`}><span aria-hidden="true">{icon}</span>{count !== undefined && `${count} `}{label}</span>;
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
}

function TrackerPage({ item, docs, receivedCount, unconfirmedCount, missingCount, onStatus, onChase, onAudit, onQueue }: TrackerPageProps) {
  const totalRequired = docs.filter((doc) => doc.required).length;
  const complete = totalRequired ? Math.round((receivedCount / totalRequired) * 100) : 0;
  const requiredDocs = docs.filter((doc) => doc.required);
  const optionalDocs = docs.filter((doc) => !doc.required);
  return (
    <>
      <div className="case-heading">
        <div className="breadcrumb"><button onClick={onQueue}>← All cases</button><span>/</span><span className="eyebrow">{item.id}</span></div>
        <div className="case-heading-row"><div><h1>{item.client}</h1><div className="case-meta"><span>Client type: <b>{item.type}</b></span><span>Manager: <b>{item.rm}</b></span><span>Location: <b>{item.jurisdiction}</b></span></div></div>
          <div className="heading-actions"><button className="button" onClick={onAudit}>Activity history</button><button className="button button-dark" onClick={onChase} disabled={missingCount === 0}>Prepare follow-up <span className="button-count">{missingCount} missing</span></button></div>
        </div>
      </div>
      <div className="tracker-layout">
        <section className="tracker-main">
          <div className="completeness-card"><div className="completeness-heading"><strong>{receivedCount} of {totalRequired} required documents received</strong><span>{missingCount} missing · {unconfirmedCount} need review</span></div><div className="progress" aria-label={`${complete}% of required documents received`}><span style={{ width: `${complete}%` }} /></div><p className="demo-explainer">This is sample data. Your changes are temporary and will reset when you refresh.</p></div>
          <section className="document-panel">
            <div className="panel-heading"><div><span className="panel-icon">☷</span><h2>Required documents</h2></div></div>
            <div className="document-list">
              {requiredDocs.map((doc) => <DocumentRow key={doc.id} doc={doc} onStatus={onStatus} />)}
            </div>
          </section>
          {optionalDocs.length > 0 && <details className="optional-documents"><summary>Optional documents ({optionalDocs.length})</summary><div className="document-list">{optionalDocs.map((doc) => <DocumentRow key={doc.id} doc={doc} onStatus={onStatus} />)}</div></details>}
        </section>
        <ChaseSummary item={item} docs={docs} onChase={onChase} />
      </div>
    </>
  );
}

function DocumentRow({ doc, onStatus }: { doc: CaseRecord["documents"][number]; onStatus: (id: string, status: DocumentStatus) => void }) {
  return (
    <article className={`document-row ${doc.status.toLowerCase()}`}>
      <div className="doc-main"><span className={`doc-icon ${doc.status.toLowerCase()}`} aria-hidden="true">{doc.status === "Received" ? "▤" : doc.status === "Unconfirmed" ? "▧" : "▥"}</span><div><div className="doc-name">{doc.name}</div><p>{doc.description}</p></div></div>
      <div className="obligation"><StatusBadge status={doc.status} /></div>
      <div className="doc-status">{doc.status === "Unconfirmed" && <button className="confirm-button" onClick={() => onStatus(doc.id, "Received")}>Confirm received (demo)</button>}{doc.status === "Missing" && <span className="demo-only-action">Upload unavailable in demo</span>}{doc.status === "Received" && doc.source && <span className="evidence-label">Evidence on file</span>}</div>
      {doc.source && <div className="doc-evidence"><span>Source: {doc.source}</span>{doc.updated && <span className="evidence-date">Updated {doc.updated}</span>}</div>}
    </article>
  );
}

function ChaseSummary({ item, docs, onChase }: { item: CaseRecord; docs: CaseRecord["documents"]; onChase: () => void }) {
  const chaseDocs = docs.filter((doc) => doc.required && doc.status === "Missing");
  return (
    <details className="chase-summary">
      <summary className="chase-summary-head"><span>▧</span><h2>Follow-up details</h2><span>{chaseDocs.length} missing</span></summary>
      <div className="chase-summary-body">
        <p className="demo-explainer">Sample follow-up preview only. This demo will not email the client.</p>
        <div className="eyebrow section-label">Documents to request</div>
        <div className="payload-list">{chaseDocs.map((doc) => <div key={doc.id} className={`payload-item ${doc.status.toLowerCase()}`}><span>{doc.name}</span><StatusBadge status={doc.status} count={1} /></div>)}</div>
        <div className="eyebrow section-label">Case reference</div><div className="subject-preview">{item.id} · {item.client}</div>
        {chaseDocs.length > 0 && <button className="button full-button" onClick={onChase}>Review sample message</button>}
      </div>
    </details>
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
          <section className={`blocking-note ${reviewResolved ? "resolved" : ""}`}><div className="blocking-title"><span>⚠</span><strong>{reviewResolved ? "Sample review acknowledged" : "Sample review note"}</strong><span className="hard-gate">DEMO</span></div><blockquote>The signatory list needs verification before a real client follow-up.</blockquote><p>This is sample data. Checking the box below does not verify a document or authorize a real email.</p><label className="resolve-check"><input type="checkbox" checked={reviewResolved} onChange={(event) => setReviewResolved(event.target.checked)} /><span>{reviewResolved ? "Sample note acknowledged" : "Acknowledge for this demo"}</span></label></section>
          <div className="form-field"><label htmlFor="recipients">To Recipient(s): <small>Corporate Entity Officers</small></label><input id="recipients" value={recipient} onChange={(event) => setRecipient(event.target.value)} /></div>
          <div className="form-field"><label htmlFor="cc">CC / Compliance Archive: <small>Audit Archiving Node</small></label><input id="cc" value={cc} onChange={(event) => setCc(event.target.value)} /></div>
          <div className="form-field"><label htmlFor="subject">Subject Line:</label><input id="subject" value={subject} onChange={(event) => setSubject(event.target.value)} /></div>
          <div className="form-field body-field"><label htmlFor="email-body">Email Draft Body (Bank Standard): <button className="link-button" onClick={() => setEmailBody(`Dear Treasury Team at ${item.client},\\n\\nWe are following up on your institutional onboarding documentation for Case Ref ${item.id}. Please submit the outstanding items using your secure upload portal.\\n\\nRegards,\\nInstitutional Onboarding Team`)}>Revert to Master Template</button></label><div className="editor-toolbar"><button aria-label="Bold">B</button><button aria-label="Italic"><i>I</i></button><button aria-label="List">☷</button><span /> <button aria-label="Insert link">↗</button><span className="editor-filter">Auto-Filtered: Missing Items Only</span></div><textarea id="email-body" value={emailBody} onChange={(event) => setEmailBody(event.target.value)} /></div>
          <div className="secure-token">DEMO <span>Example upload reference: <b>{item.id}-SAMPLE</b></span><strong>Not a real upload link</strong></div>
        </div>
        <footer className="composer-footer"><span>{saved ? "Sample draft saved in this session" : "Sample message · not connected to email"}</span><div><button className="button" onClick={onSave}>Save sample draft</button><button className="button button-dark" disabled={!reviewResolved} onClick={onDispatch}>Simulate only · no email sent</button></div></footer>
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
