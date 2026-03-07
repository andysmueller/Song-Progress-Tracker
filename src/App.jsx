import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mxclokwdyvjhdzkgmybw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14Y2xva3dkeXZqaGR6a2dteWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MzI5MzAsImV4cCI6MjA4ODQwODkzMH0.-eQeSgXq6cWEElRSi9PsmYHLbEuli7tqM0ZIa3Pvg0w";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const STAGES = [
  { id: "idea",         label: "Idea Generation",          short: "IDEA",    color: "#c8905a" },
  { id: "songwriting",  label: "Songwriting / Arrangement", short: "WRITE",   color: "#b86c30" },
  { id: "vocal",        label: "Vocal Recording",           short: "VOCALS",  color: "#a07848" },
  { id: "vocalmix",     label: "Vox Mix",                   short: "VOX-MIX", color: "#c8905a" },
  { id: "premix",       label: "Pre-Mix",                   short: "PRE-MIX", color: "#7aab98" },
  { id: "mixing",       label: "Mixing",                    short: "MIXING",  color: "#b86c30" },
  { id: "mastering",    label: "Mastering",                 short: "MASTER",  color: "#9a6040" },
  { id: "assets",       label: "Release Assets",            short: "ASSETS",  color: "#7aab98" },
  { id: "distribution", label: "Distribution",              short: "DISTRO",  color: "#6a9a78" },
];

const PRIORITIES = [
  { id: "next_single", label: "Next Single", short: "NEXT SINGLE", color: "#8250b4", icon: "🎯" },
  { id: "high",        label: "High",        short: "HIGH",        color: "#c34128", icon: "●" },
  { id: "medium",      label: "Medium",      short: "MEDIUM",      color: "#b86c30", icon: "●" },
  { id: "low",         label: "Low",         short: "LOW",         color: "#9a8060", icon: "●" },
];

const STAGE_IDS = STAGES.map(s => s.id);
const defaultDeadlines = () => STAGE_IDS.reduce((acc, id) => ({ ...acc, [id]: "" }), {});

function getPriority(id) { return PRIORITIES.find(p => p.id === id) || PRIORITIES[2]; }
function getStage(id) { return STAGES.find(s => s.id === id) || STAGES[0]; }

function getNextDeadline(project) {
  const deadlines = project.deadlines || {};
  const currentIdx = STAGE_IDS.indexOf(project.stage);
  for (let i = currentIdx; i < STAGE_IDS.length; i++) {
    const id = STAGE_IDS[i];
    if (deadlines[id]) return { stage: STAGES[i], date: deadlines[id] };
  }
  return null;
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const FL = ({ children }) => (
  <div style={{ fontSize: 8, fontFamily: "'DM Mono', monospace", letterSpacing: 2, color: "#c0a880", textTransform: "uppercase", marginBottom: 5 }}>{children}</div>
);

const FI = ({ value, onChange, placeholder, as = "input", style = {} }) => {
  const base = { width: "100%", background: "rgba(255,255,255,0.65)", border: "1px solid #ddd0b8", borderRadius: 6, color: "#3a2010", padding: "8px 10px", fontSize: 12, fontFamily: "Georgia, serif", outline: "none", ...style };
  if (as === "textarea") return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...base, resize: "vertical", minHeight: 56 }} />;
  if (as === "select") return null;
  return <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} />;
};

function StageBar({ currentStage, onStageClick }) {
  const currentIdx = STAGE_IDS.indexOf(currentStage);
  return (
    <div style={{ display: "flex", gap: 3, height: 4 }}>
      {STAGES.map((stage, i) => (
        <button key={stage.id} title={stage.label} onClick={() => onStageClick(stage.id)}
          style={{ flex: 1, background: i < currentIdx ? "rgba(184,108,48,0.32)" : i === currentIdx ? stage.color : "#e8ddd0", border: "none", borderRadius: 2, cursor: "pointer", outline: "none", transition: "all 0.15s" }} />
      ))}
    </div>
  );
}

function VocalistSection({ vocalists = [], onChange }) {
  const [name, setName] = useState("");
  const [spotify, setSpotify] = useState("");
  const [submitter, setSubmitter] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    const newV = { id: Date.now(), name, spotify, submitter, status: "pending" };
    onChange([...vocalists, newV]);
    setName(""); setSpotify(""); setSubmitter("");
  };

  const setStatus = (id, status) => onChange(vocalists.map(v => v.id === id ? { ...v, status } : v));

  const approved = vocalists.filter(v => v.status === "approved");
  const denied   = vocalists.filter(v => v.status === "denied");
  const pending  = vocalists.filter(v => v.status === "pending");

  const VCard = ({ v }) => (
    <div style={{ background: "#fff9f2", border: "1px solid #e4d8c4", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12, opacity: v.status === "denied" ? 0.5 : 1 }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: v.status === "approved" ? "linear-gradient(135deg,#5a9a88,#7aab98)" : v.status === "denied" ? "#c0b0a0" : "linear-gradient(135deg,#8250b4,#b06ae0)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 11, color: "#f2eadc" }}>
        {v.name.slice(0,2).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, color: "#1a0f06", marginBottom: 3 }}>{v.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {v.spotify && <a href={v.spotify} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "#1db954", textDecoration: "none", fontSize: 9, fontFamily: "'DM Mono',monospace", fontWeight: 500 }}>
            <span style={{ width: 10, height: 10, background: "#1db954", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 6, color: "#fff" }}>♪</span>Spotify ↗
          </a>}
          {v.submitter && <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#c0a880" }}>· by {v.submitter}</span>}
        </div>
      </div>
      {v.status === "pending" ? (
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={() => setStatus(v.id, "approved")} style={{ borderRadius: 5, padding: "5px 11px", fontFamily: "'DM Mono',monospace", fontSize: 8, fontWeight: 600, letterSpacing: 1, cursor: "pointer", background: "rgba(90,154,136,0.1)", border: "1px solid rgba(90,154,136,0.3)", color: "#5a9a88" }}>✓ APPROVE</button>
          <button onClick={() => setStatus(v.id, "denied")}   style={{ borderRadius: 5, padding: "5px 11px", fontFamily: "'DM Mono',monospace", fontSize: 8, fontWeight: 600, letterSpacing: 1, cursor: "pointer", background: "rgba(180,70,40,0.08)", border: "1px solid rgba(180,70,40,0.25)", color: "#b84028" }}>✕ DENY</button>
        </div>
      ) : (
        <span style={{ borderRadius: 5, padding: "4px 10px", fontFamily: "'DM Mono',monospace", fontSize: 8, fontWeight: 600, letterSpacing: 1, background: v.status === "approved" ? "rgba(90,154,136,0.1)" : "rgba(180,70,40,0.08)", border: `1px solid ${v.status === "approved" ? "rgba(90,154,136,0.3)" : "rgba(180,70,40,0.25)"}`, color: v.status === "approved" ? "#5a9a88" : "#b84028" }}>
          {v.status === "approved" ? "✓ APPROVED" : "✕ DENIED"}
        </span>
      )}
    </div>
  );

  return (
    <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid #e0d0b8" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 3, color: "#a07848", textTransform: "uppercase" }}>🎤 Vocalist Recommendations</span>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#c0a880" }}>{vocalists.length} suggestion{vocalists.length !== 1 ? "s" : ""}{approved.length ? ` · ${approved.length} approved` : ""}</span>
      </div>

      {vocalists.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {approved.map(v => <VCard key={v.id} v={v} />)}
          {denied.map(v => <VCard key={v.id} v={v} />)}
          {pending.length > 0 && approved.length + denied.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#e8ddd0" }} />
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 7, color: "#c8b090", letterSpacing: 2, textTransform: "uppercase", whiteSpace: "nowrap" }}>Awaiting Decision</span>
              <div style={{ flex: 1, height: 1, background: "#e8ddd0" }} />
            </div>
          )}
          {pending.map(v => <VCard key={v.id} v={v} />)}
        </div>
      )}

      <div style={{ background: "rgba(240,232,218,0.5)", border: "1px dashed #d0c0a4", borderRadius: 8, padding: "14px 16px" }}>
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: 2.5, color: "#b09060", textTransform: "uppercase", marginBottom: 12 }}>+ Suggest a Vocalist</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
          <div><FL>Artist Name</FL><FI value={name} onChange={setName} placeholder="e.g. Summer Vale" /></div>
          <div><FL>Spotify Link</FL><FI value={spotify} onChange={setSpotify} placeholder="open.spotify.com/..." /></div>
          <div><FL>Your Name</FL><FI value={submitter} onChange={setSubmitter} placeholder="Who's suggesting?" /></div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={submit} style={{ background: "#1a0f06", border: "none", borderRadius: 6, color: "#f2eadc", padding: "8px 18px", fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 2, cursor: "pointer" }}>SUBMIT</button>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, onDelete, onRefresh, expanded, onToggle, dragHandlers }) {
  const stage = getStage(project.stage);
  const priority = getPriority(project.priority);
  const nextDeadline = getNextDeadline(project);

  const [local, setLocal] = useState({
    title: project.title || "",
    collaborators: project.collaborators || "",
    producers: project.producers || "",
    writers: project.writers || "",
    owner: project.owner || "",
    notes: project.notes || "",
    bounce_link: project.bounce_link || "",
    assets_link: project.assets_link || "",
    stage: project.stage || "idea",
    priority: project.priority || "medium",
    deadlines: project.deadlines || defaultDeadlines(),
    vocalists: project.vocalists || [],
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setLocal({
      title: project.title || "",
      collaborators: project.collaborators || "",
      producers: project.producers || "",
      writers: project.writers || "",
      owner: project.owner || "",
      notes: project.notes || "",
      bounce_link: project.bounce_link || "",
      assets_link: project.assets_link || "",
      stage: project.stage || "idea",
      priority: project.priority || "medium",
      deadlines: project.deadlines || defaultDeadlines(),
      vocalists: project.vocalists || [],
    });
    setDirty(false);
  }, [project.id]);

  const set = (field, value) => { setLocal(prev => ({ ...prev, [field]: value })); setDirty(true); setSaved(false); };
  const setDeadline = (stageId, value) => { setLocal(prev => ({ ...prev, deadlines: { ...prev.deadlines, [stageId]: value } })); setDirty(true); setSaved(false); };

  const handleUpdate = async () => {
    setSaving(true);
    await supabase.from("projects").update({ ...local }).eq("id", project.id);
    setSaving(false); setSaved(true); setDirty(false);
    await onRefresh();
    setTimeout(() => setSaved(false), 2500);
  };

  const displayStage = getStage(local.stage);
  const displayPriority = getPriority(local.priority);

  // Priority strip colors
  const stripColors = {
    next_single: "linear-gradient(90deg, #8250b4, #b06ae0)",
    high:        "linear-gradient(90deg, #c34128, #e05840)",
    medium:      "linear-gradient(90deg, #b86c30, #d48840)",
    low:         "linear-gradient(90deg, #b0a090, #ccc0b0)",
  };

  return (
    <div {...dragHandlers} style={{ background: "#fff9f2", border: "1px solid #ddd0b8", borderRadius: 12, marginBottom: 10, overflow: "hidden", boxShadow: expanded ? "0 4px 20px rgba(26,15,6,0.1)" : "0 1px 4px rgba(26,15,6,0.06)", transition: "box-shadow 0.2s", cursor: "grab" }}>

      {/* Priority strip */}
      <div style={{ height: 3, background: stripColors[local.priority] || stripColors.medium }} />

      {/* Card header */}
      <div style={{ padding: "13px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: "#1a0f06", letterSpacing: 1, textTransform: "uppercase", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {project.title || <span style={{ color: "#c0a880", fontStyle: "italic", fontWeight: 400, fontSize: 13, textTransform: "none", fontFamily: "Georgia,serif" }}>Untitled</span>}
          </span>
          <span style={{ borderRadius: 4, padding: "2px 8px", fontSize: 8, fontFamily: "'DM Mono',monospace", fontWeight: 600, letterSpacing: 1, background: `${displayPriority.color}18`, border: `1px solid ${displayPriority.color}44`, color: displayPriority.color, whiteSpace: "nowrap" }}>
            {displayPriority.icon} {displayPriority.short}
          </span>
          <span style={{ borderRadius: 4, padding: "2px 8px", fontSize: 8, fontFamily: "'DM Mono',monospace", fontWeight: 600, letterSpacing: 1, background: `${displayStage.color}18`, border: `1px solid ${displayStage.color}44`, color: displayStage.color, whiteSpace: "nowrap" }}>
            {displayStage.short}
          </span>
        </div>

        {/* Collaborator + owner */}
        <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#a08060", marginBottom: 4, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {project.collaborators ? <span>w/ {project.collaborators}</span> : <span style={{ color: "#c8b090" }}>No collaborators</span>}
          {project.owner && <><span>·</span><span style={{ color: displayStage.color, fontWeight: 500 }}>→ {project.owner}</span></>}
        </div>

        {/* Credits annotation */}
        {(project.producers || project.writers) && (
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#c0a070", fontStyle: "italic", marginBottom: 4 }}>
            {project.producers && <span><span style={{ color: "#a08060", fontStyle: "normal" }}>prod.</span> {project.producers}</span>}
            {project.producers && project.writers && <span> · </span>}
            {project.writers && <span><span style={{ color: "#a08060", fontStyle: "normal" }}>written by</span> {project.writers}</span>}
          </div>
        )}
      </div>

      {/* Stage bar */}
      <div style={{ padding: "10px 16px 4px" }}>
        <StageBar currentStage={local.stage} onStageClick={(id) => set("stage", id)} />
      </div>

      {/* Deadline under bar */}
      <div style={{ padding: "5px 16px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {nextDeadline
          ? <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#b0906a" }}>📅 {nextDeadline.stage.short} due <strong style={{ color: "#8a5a28" }}>{formatDate(nextDeadline.date)}</strong></span>
          : <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#d0c0a8" }}>No deadline set</span>}
        {/* Bounce quick link */}
        {project.bounce_link && (
          <a href={project.bounce_link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
            style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "rgba(122,171,152,0.12)", border: "1px solid rgba(122,171,152,0.3)", borderRadius: 5, padding: "3px 9px", textDecoration: "none" }}>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, color: "#5a9a88", fontWeight: 600 }}>🎵 BOUNCE ↗</span>
          </a>
        )}
      </div>

      {/* Notes preview */}
      {project.notes && !expanded && (
        <div onClick={onToggle} style={{ margin: "0 16px 10px", padding: "9px 12px", background: "rgba(240,230,215,0.6)", border: "1px solid #e4d8c4", borderRadius: 7, cursor: "pointer" }}>
          <div style={{ fontSize: 8, fontFamily: "'DM Mono',monospace", letterSpacing: 2, color: "#c8b090", textTransform: "uppercase", marginBottom: 3 }}>Notes</div>
          <div style={{ fontSize: 12, color: "#5a3a18", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{project.notes}</div>
        </div>
      )}

      {/* Toggle */}
      <div onClick={onToggle} style={{ padding: "6px 16px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
        <div style={{ display: "flex", gap: 3, opacity: 0.2 }}>
          {[[0,1,2],[0,1,2]].map((col, ci) => (
            <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {col.map(r => <div key={r} style={{ width: 3, height: 3, borderRadius: "50%", background: "#7a5a38" }} />)}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {dirty && <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, color: "#b86c3077", letterSpacing: 1 }}>● UNSAVED</span>}
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, color: "#c8b090", letterSpacing: 1.5 }}>{expanded ? "COLLAPSE" : "EDIT / DETAILS"}</span>
          <span style={{ fontSize: 9, color: "#c8b090", display: "inline-block", transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={{ borderTop: "1px solid #e8ddd0", padding: "18px 16px", background: "rgba(245,238,226,0.6)" }}>

          {/* Main fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px", marginBottom: 14 }}>
            <div><FL>Song Title</FL><FI value={local.title} onChange={v => set("title", v)} placeholder="Enter title..." /></div>
            <div><FL>Featured Artist / Collaborator</FL><FI value={local.collaborators} onChange={v => set("collaborators", v)} placeholder="Mila V, DJ Cru..." /></div>
            <div><FL>Next Steps Owner</FL><FI value={local.owner} onChange={v => set("owner", v)} placeholder="Name or role..." /></div>
            <div>
              <FL>Stage</FL>
              <select value={local.stage} onChange={e => set("stage", e.target.value)} style={{ width: "100%", background: "rgba(255,255,255,0.65)", border: "1px solid #ddd0b8", borderRadius: 6, color: "#3a2010", padding: "8px 10px", fontSize: 12, fontFamily: "Georgia,serif", outline: "none" }}>
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1/-1" }}><FL>Notes</FL><FI as="textarea" value={local.notes} onChange={v => set("notes", v)} placeholder="Session notes, references, links..." /></div>
          </div>

          {/* Credits */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px", marginBottom: 16, paddingTop: 14, borderTop: "1px solid #e8ddd0" }}>
            <div style={{ gridColumn: "1/-1", fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 3, color: "#a07848", textTransform: "uppercase", marginBottom: 4 }}>📋 Credits</div>
            <div><FL>Producers</FL><FI value={local.producers} onChange={v => set("producers", v)} placeholder="DJ Cru, Andy M..." /></div>
            <div><FL>Writers</FL><FI value={local.writers} onChange={v => set("writers", v)} placeholder="Andy M, Rue T..." /></div>
          </div>

          {/* Dropbox Links */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 3, color: "#a07848", textTransform: "uppercase", marginBottom: 12 }}>Dropbox Links</div>
            <div style={{ background: "rgba(255,255,255,0.4)", border: "1px solid #e4d8c4", borderRadius: 10, overflow: "hidden" }}>
              {[
                { key: "bounce_link", icon: "🎵", label: "Latest Bounce" },
                { key: "assets_link", icon: "🖼️", label: "Album Art / Assets" },
              ].map(({ key, icon, label }, i) => (
                <div key={key} style={{ display: "flex", alignItems: "center", borderBottom: i === 0 ? "1px solid #e8ddd0" : "none" }}>
                  <div style={{ width: 42, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, background: "rgba(240,232,218,0.6)", alignSelf: "stretch", borderRight: "1px solid #e8ddd0" }}>{icon}</div>
                  <div style={{ width: 130, flexShrink: 0, padding: "12px 14px", borderRight: "1px solid #e8ddd0", alignSelf: "stretch", display: "flex", alignItems: "center" }}>
                    <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 1.5, color: "#a08060", textTransform: "uppercase", fontWeight: 500 }}>{label}</span>
                  </div>
                  <div style={{ flex: 1, padding: "0 12px" }}>
                    <input value={local[key]} onChange={e => set(key, e.target.value)} placeholder="Paste Dropbox link..."
                      style={{ width: "100%", background: "transparent", border: "none", color: "#3a2010", fontFamily: "'DM Mono',monospace", fontSize: 11, outline: "none", padding: "12px 0" }} />
                  </div>
                  <div style={{ flexShrink: 0, padding: "0 14px" }}>
                    {local[key]
                      ? <a href={local[key]} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#1a0f06", color: "#f2eadc", borderRadius: 6, padding: "6px 12px", fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 1.5, textDecoration: "none", fontWeight: 500 }}>OPEN ↗</a>
                      : <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "transparent", color: "#c8b090", border: "1px solid #e0d0b8", borderRadius: 6, padding: "6px 12px", fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 1.5 }}>OPEN ↗</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div style={{ marginBottom: 16 }}>
            <FL>Priority</FL>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
              {PRIORITIES.map(p => (
                <button key={p.id} onClick={() => set("priority", p.id)}
                  style={{ borderRadius: 7, padding: "8px 0", textAlign: "center", fontSize: 9, fontFamily: "'DM Mono',monospace", fontWeight: 600, letterSpacing: 1, cursor: "pointer", border: `1px solid ${local.priority === p.id ? p.color + "88" : p.color + "33"}`, background: local.priority === p.id ? `${p.color}20` : `${p.color}08`, color: p.color, boxShadow: local.priority === p.id ? `0 2px 8px ${p.color}22` : "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, transition: "all 0.15s" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color }} />
                  {p.short}
                </button>
              ))}
            </div>
          </div>

          {/* Deadlines */}
          <div style={{ marginBottom: 16 }}>
            <FL>Stage Deadlines</FL>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8 }}>
              {STAGES.map(stage => {
                const isCurrent = stage.id === local.stage;
                const isPast = STAGE_IDS.indexOf(stage.id) < STAGE_IDS.indexOf(local.stage);
                return (
                  <div key={stage.id} style={{ background: isCurrent ? `${stage.color}0d` : "rgba(255,255,255,0.4)", border: `1px solid ${isCurrent ? stage.color + "33" : "#e8d8c0"}`, borderRadius: 7, padding: "7px 9px", opacity: isPast ? 0.45 : 1 }}>
                    <div style={{ fontSize: 8, fontFamily: "'DM Mono',monospace", fontWeight: 600, letterSpacing: 1, color: isCurrent ? stage.color : "#b8a888", marginBottom: 4, display: "flex", alignItems: "center", gap: 3 }}>
                      {isPast && <span style={{ color: "#7aab98" }}>✓</span>}{stage.short}
                    </div>
                    <input type="date" value={local.deadlines[stage.id] || ""} onChange={e => setDeadline(stage.id, e.target.value)}
                      style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${isCurrent ? stage.color + "44" : "#e0d0b8"}`, borderRadius: 0, color: local.deadlines[stage.id] ? "#5a3a20" : "#c8b090", fontSize: 10, fontFamily: "'DM Mono',monospace", outline: "none", padding: "2px 0" }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vocalist section — only when stage = vocal */}
          {local.stage === "vocal" && (
            <VocalistSection vocalists={local.vocalists} onChange={v => set("vocalists", v)} />
          )}

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid #e8ddd0" }}>
            <button onClick={onDelete} style={{ background: "transparent", border: "1px solid rgba(180,70,40,0.18)", color: "rgba(180,70,40,0.35)", borderRadius: 6, padding: "7px 16px", fontSize: 10, fontFamily: "'DM Mono',monospace", letterSpacing: 1.5, cursor: "pointer" }}>DELETE</button>
            <button onClick={handleUpdate} disabled={saving}
              style={{ background: saved ? "#7aab98" : dirty ? "#b86c30" : "#c8b898", border: "none", borderRadius: 7, color: "#f2eadc", padding: "9px 28px", fontSize: 10, fontFamily: "'DM Mono',monospace", fontWeight: 600, letterSpacing: 2.5, cursor: saving ? "wait" : "pointer", boxShadow: dirty ? "0 3px 12px rgba(184,108,48,0.28)" : "none", transition: "all 0.2s" }}>
              {saving ? "SAVING..." : saved ? "✓ SAVED" : "UPDATE"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterBtn({ active, onClick, color, children }) {
  return (
    <button onClick={onClick} style={{ background: active ? color : "transparent", border: `1px solid ${active ? color : "#d0bfa0"}`, color: active ? "#f2eadc" : "#7a5a38", borderRadius: 20, padding: "5px 13px", fontSize: 10, fontFamily: "'DM Mono',monospace", fontWeight: 500, letterSpacing: 1, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}>{children}</button>
  );
}

const inputStyle = { width: "100%", background: "rgba(255,255,255,0.55)", border: "1px solid #e0d0b8", borderRadius: 6, color: "#3a2010", padding: "8px 10px", fontSize: 12, fontFamily: "'DM Mono',monospace", outline: "none" };

export default function MusicTracker() {
  const [projects, setProjects] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [stageFilter, setStageFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase.from("projects").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
    if (!error) setProjects(data || []);
    setLoading(false);
  };

  const addProject = async () => {
    setAdding(true);
    const maxOrder = projects.length ? Math.max(...projects.map(p => p.sort_order || 0)) + 1 : 0;
    const { data, error } = await supabase.from("projects").insert([{ title: "", collaborators: "", producers: "", writers: "", stage: "idea", owner: "", notes: "", deadlines: defaultDeadlines(), bounce_link: "", assets_link: "", priority: "medium", sort_order: maxOrder, vocalists: [] }]).select().single();
    if (!error && data) { await fetchProjects(); setExpanded(data.id); }
    setAdding(false);
  };

  const deleteProject = async (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (expanded === id) setExpanded(null);
    await supabase.from("projects").delete().eq("id", id);
  };

  // Drag handlers
  const handleDragStart = (id) => setDragId(id);
  const handleDragOver = (e, id) => { e.preventDefault(); setDragOverId(id); };
  const handleDrop = async (e, targetId) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return; }
    const reordered = [...projects];
    const fromIdx = reordered.findIndex(p => p.id === dragId);
    const toIdx = reordered.findIndex(p => p.id === targetId);
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const updated = reordered.map((p, i) => ({ ...p, sort_order: i }));
    setProjects(updated);
    setDragId(null); setDragOverId(null);
    for (const p of updated) {
      await supabase.from("projects").update({ sort_order: p.sort_order }).eq("id", p.id);
    }
  };

  const filtered = projects.filter(p => {
    const matchStage = stageFilter === "all" || p.stage === stageFilter;
    const matchPriority = priorityFilter === "all" || p.priority === priorityFilter;
    const matchSearch = !search || (p.title || "").toLowerCase().includes(search.toLowerCase()) || (p.collaborators || "").toLowerCase().includes(search.toLowerCase()) || (p.owner || "").toLowerCase().includes(search.toLowerCase());
    return matchStage && matchPriority && matchSearch;
  });

  const stageCounts = STAGE_IDS.reduce((acc, id) => ({ ...acc, [id]: projects.filter(p => p.stage === id).length }), {});
  const priCounts = PRIORITIES.reduce((acc, p) => ({ ...acc, [p.id]: projects.filter(pr => pr.priority === p.id).length }), {});

  return (
    <div style={{ minHeight: "100vh", background: "#1a0f06", fontFamily: "Georgia,serif" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", right: "-5%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(210,150,80,0.1) 0%, transparent 70%)", animation: "drift1 20s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(190,110,70,0.07) 0%, transparent 70%)", animation: "drift2 25s ease-in-out infinite" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", padding: "32px 16px" }}>
        <div style={{ background: "#f2eadc", borderRadius: 20, padding: "clamp(24px,5vw,44px) clamp(20px,5vw,48px)", position: "relative", overflow: "hidden", boxShadow: "0 12px 60px rgba(0,0,0,0.45)" }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 90% 0%, rgba(200,140,70,0.1) 0%, transparent 50%), radial-gradient(ellipse at 0% 100%, rgba(180,100,50,0.07) 0%, transparent 50%)" }} />

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid #ddd0b8", flexWrap: "wrap", gap: 16, position: "relative" }}>
            <div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: 5, color: "#b09050", textTransform: "uppercase", marginBottom: 10 }}>Koastle · Studio Dashboard</div>
              <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(36px,8vw,52px)", fontWeight: 300, color: "#1a0f06", lineHeight: 1 }}>
                Music<br /><em style={{ fontStyle: "italic", color: "#b86c30" }}>Tracker</em>
              </h1>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12, paddingTop: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#b86c30", boxShadow: "0 0 8px #b86c3099", animation: "pulse 2s infinite" }} />
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#c8a870", letterSpacing: 2 }}>LIVE SYNC</span>
              </div>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "#a08060", letterSpacing: 1 }}>{projects.length} project{projects.length !== 1 ? "s" : ""}</span>
              <button onClick={addProject} disabled={adding} style={{ background: adding ? "#c8b898" : "#1a0f06", border: "none", borderRadius: 8, color: "#f2eadc", padding: "10px 20px", fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: 2.5, cursor: adding ? "wait" : "pointer", boxShadow: "0 3px 12px rgba(26,15,6,0.3)", whiteSpace: "nowrap" }}>{adding ? "ADDING..." : "+ NEW PROJECT"}</button>
            </div>
          </div>

          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap", position: "relative" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." style={{ ...inputStyle, flex: 1, minWidth: 160 }} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <FilterBtn active={priorityFilter === "all"} onClick={() => setPriorityFilter("all")} color="#b86c30">ALL</FilterBtn>
              {PRIORITIES.map(p => priCounts[p.id] > 0 && <FilterBtn key={p.id} active={priorityFilter === p.id} onClick={() => setPriorityFilter(p.id)} color={p.color}>{p.icon} {p.short}</FilterBtn>)}
            </div>
          </div>

          {/* Stage filter */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #e0d0b8", position: "relative", alignItems: "center" }}>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, color: "#c8b090", letterSpacing: 2, textTransform: "uppercase" }}>Stage</span>
            <FilterBtn active={stageFilter === "all"} onClick={() => setStageFilter("all")} color="#b86c30">ALL ({projects.length})</FilterBtn>
            {STAGES.map(s => stageCounts[s.id] > 0 && <FilterBtn key={s.id} active={stageFilter === s.id} onClick={() => setStageFilter(s.id)} color={s.color}>{s.short} ({stageCounts[s.id]})</FilterBtn>)}
          </div>

          {/* Pipeline summary */}
          <div style={{ display: "flex", marginBottom: 24, background: "rgba(255,255,255,0.35)", border: "1px solid #e0d0b8", borderRadius: 12, overflow: "hidden", position: "relative" }}>
            {STAGES.map((stage, i) => (
              <div key={stage.id} onClick={() => setStageFilter(stageFilter === stage.id ? "all" : stage.id)}
                style={{ flex: "1 0 auto", minWidth: 52, padding: "10px 4px", textAlign: "center", borderRight: i < STAGES.length - 1 ? "1px solid #e8d8c0" : "none", cursor: "pointer", background: stageFilter === stage.id ? `${stage.color}0d` : "transparent", transition: "background 0.15s" }}>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: stageCounts[stage.id] ? stage.color : "#e0d0b8" }}>{stageCounts[stage.id]}</div>
                <div style={{ fontSize: 7, fontFamily: "'DM Mono',monospace", color: "#c8b090", letterSpacing: 0.5, marginTop: 2 }}>{stage.short}</div>
              </div>
            ))}
          </div>

          {/* Projects */}
          {loading ? (
            <div style={{ textAlign: "center", color: "#c8b090", padding: "60px 0", fontFamily: "'DM Mono',monospace", letterSpacing: 3, fontSize: 11 }}>LOADING...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: "#c8b090", padding: "60px 0", fontStyle: "italic", fontSize: 14 }}>No projects found.</div>
          ) : filtered.map(p => (
            <ProjectCard
              key={p.id} project={p}
              onDelete={() => deleteProject(p.id)}
              onRefresh={fetchProjects}
              expanded={expanded === p.id}
              onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
              dragHandlers={{
                draggable: true,
                onDragStart: () => handleDragStart(p.id),
                onDragOver: e => handleDragOver(e, p.id),
                onDrop: e => handleDrop(e, p.id),
                onDragEnd: () => { setDragId(null); setDragOverId(null); },
                style: { opacity: dragId === p.id ? 0.4 : 1, outline: dragOverId === p.id ? "2px solid #b86c30" : "none", transition: "opacity 0.15s" },
              }}
            />
          ))}

          <div style={{ marginTop: 28, paddingTop: 16, borderTop: "1px solid #ddd0b8", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, position: "relative" }}>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, color: "#c8b090", letterSpacing: 2 }}>GOOGLE CALENDAR · COMING SOON</span>
            <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 13, fontStyle: "italic", color: "rgba(184,108,48,0.4)" }}>Studio OS v2.0</span>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&family=DM+Mono:wght@300;400;500&family=Syne:wght@400;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #1a0f06; }
        input::placeholder, textarea::placeholder { color: #c8b090; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: opacity(0.3); }
        select option { background: #f2eadc; color: #3a2010; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.15} }
        @keyframes drift1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-3%,5%)} }
        @keyframes drift2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(4%,-4%)} }
      `}</style>
    </div>
  );
}
