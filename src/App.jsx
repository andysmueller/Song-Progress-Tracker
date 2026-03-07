import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mxclokwdyvjhdzkgmybw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14Y2xva3dkeXZqaGR6a2dteWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MzI5MzAsImV4cCI6MjA4ODQwODkzMH0.-eQeSgXq6cWEElRSi9PsmYHLbEuli7tqM0ZIa3Pvg0w";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const STAGES = [
  { id: "idea",         label: "Idea Generation",          short: "IDEA",    color: "#c8905a" },
  { id: "songwriting",  label: "Songwriting / Arrangement", short: "WRITE",   color: "#b86c30" },
  { id: "vocal",        label: "Vocal Recording",           short: "VOCALS",  color: "#a07848" },
  { id: "vocalmix",     label: "Vocal Mix",                 short: "VOX-MIX", color: "#c8905a" },
  { id: "premix",       label: "Pre-Mix",                   short: "PRE-MIX", color: "#7aab98" },
  { id: "mixing",       label: "Mixing",                    short: "MIXING",  color: "#b86c30" },
  { id: "mastering",    label: "Mastering",                 short: "MASTER",  color: "#9a6040" },
  { id: "assets",       label: "Release Assets",            short: "ASSETS",  color: "#7aab98" },
  { id: "distribution", label: "Distribution",              short: "DISTRO",  color: "#6a9a78" },
];

const STAGE_IDS = STAGES.map(s => s.id);
const defaultDeadlines = () => STAGE_IDS.reduce((acc, id) => ({ ...acc, [id]: "" }), {});

function getNextDeadline(project) {
  const deadlines = project.deadlines || {};
  const currentIdx = STAGE_IDS.indexOf(project.stage);
  for (let i = currentIdx; i < STAGE_IDS.length; i++) {
    const id = STAGE_IDS[i];
    if (deadlines[id]) return { stageId: id, stage: STAGES[i], date: deadlines[id] };
  }
  return null;
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function StageBar({ currentStage, onStageClick }) {
  const currentIdx = STAGE_IDS.indexOf(currentStage);
  return (
    <div style={{ display: "flex", gap: 3, height: 6, marginTop: 12 }}>
      {STAGES.map((stage, i) => {
        const isPast = i < currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <button key={stage.id}
            title={stage.label}
            onClick={() => onStageClick(stage.id)}
            style={{ flex: 1, background: isPast ? "#b86c3055" : isCurrent ? "#b86c30" : "#e8d8c0", border: "none", borderRadius: 3, cursor: "pointer", outline: "none", transition: "all 0.15s" }} />
        );
      })}
    </div>
  );
}

function ProjectCard({ project, onDelete, onRefresh, expanded, onToggle }) {
  const currentStage = STAGES.find(s => s.id === project.stage) || STAGES[0];
  const nextDeadline = getNextDeadline(project);

  // All local state — only pushed to DB on UPDATE click
  const [local, setLocal] = useState({
    title: project.title || "",
    collaborators: project.collaborators || "",
    owner: project.owner || "",
    notes: project.notes || "",
    bounce_link: project.bounce_link || "",
    assets_link: project.assets_link || "",
    stage: project.stage || "idea",
    deadlines: project.deadlines || defaultDeadlines(),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Sync if project changes from outside
  useEffect(() => {
    setLocal({
      title: project.title || "",
      collaborators: project.collaborators || "",
      owner: project.owner || "",
      notes: project.notes || "",
      bounce_link: project.bounce_link || "",
      assets_link: project.assets_link || "",
      stage: project.stage || "idea",
      deadlines: project.deadlines || defaultDeadlines(),
    });
    setDirty(false);
  }, [project.id]);

  const set = (field, value) => {
    setLocal(prev => ({ ...prev, [field]: value }));
    setDirty(true);
    setSaved(false);
  };

  const setDeadline = (stageId, value) => {
    setLocal(prev => ({ ...prev, deadlines: { ...prev.deadlines, [stageId]: value } }));
    setDirty(true);
    setSaved(false);
  };

  const handleUpdate = async () => {
    setSaving(true);
    await supabase.from("projects").update({
      title: local.title,
      collaborators: local.collaborators,
      owner: local.owner,
      notes: local.notes,
      bounce_link: local.bounce_link,
      assets_link: local.assets_link,
      stage: local.stage,
      deadlines: local.deadlines,
    }).eq("id", project.id);
    setSaving(false);
    setSaved(true);
    setDirty(false);
    await onRefresh();
    setTimeout(() => setSaved(false), 2500);
  };

  // Use local stage for display while editing
  const displayStage = STAGES.find(s => s.id === local.stage) || STAGES[0];
  const displayNextDeadline = getNextDeadline({ ...project, stage: local.stage, deadlines: local.deadlines });

  return (
    <div style={{ background: "rgba(255,255,255,0.65)", border: `1px solid #ddd0b8`, borderLeft: `4px solid ${displayStage.color}`, borderRadius: 14, marginBottom: 12, overflow: "hidden", boxShadow: expanded ? "0 4px 24px rgba(30,16,8,0.12)" : "0 2px 8px rgba(30,16,8,0.07)", transition: "box-shadow 0.2s, border-left-color 0.2s" }}>

      {/* Top — always visible */}
      <div style={{ padding: "16px 18px 0", display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: "#1e1008", letterSpacing: 0.5, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {project.title || <span style={{ color: "#b8a888", fontStyle: "italic", textTransform: "none", fontWeight: 400, fontFamily: "Georgia, serif" }}>Untitled Project</span>}
          </div>
          <div style={{ fontSize: 12, color: "#7a5a38", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
            {project.collaborators ? `w/ ${project.collaborators}` : <span style={{ color: "#b8a888" }}>No collaborators</span>}
            {project.owner && <span style={{ marginLeft: 10, color: displayStage.color }}>→ {project.owner}</span>}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <div style={{ background: `${displayStage.color}18`, border: `1px solid ${displayStage.color}44`, color: displayStage.color, borderRadius: 20, padding: "4px 12px", fontSize: 10, fontFamily: "'DM Mono', monospace", fontWeight: 600, letterSpacing: 1 }}>{displayStage.short}</div>
          {displayNextDeadline && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: `${displayStage.color}0d`, border: `1px solid ${displayStage.color}22`, borderRadius: 6, padding: "4px 10px" }}>
              <span style={{ fontSize: 10 }}>📅</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#7a5a38" }}>
                {displayNextDeadline.stage.short} <strong style={{ color: displayStage.color }}>{formatDate(displayNextDeadline.date)}</strong>
              </span>
            </div>
          )}
          {project.bounce_link && (
            <a href={project.bounce_link} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(122,171,152,0.15)", border: "1px solid rgba(122,171,152,0.35)", borderRadius: 6, padding: "4px 10px", textDecoration: "none", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(122,171,152,0.28)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(122,171,152,0.15)"}>
              <span style={{ fontSize: 10 }}>🎵</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#7aab98", fontWeight: 500 }}>LATEST BOUNCE ↗</span>
            </a>
          )}
        </div>
      </div>

      {/* Stage bar */}
      <div style={{ padding: "0 18px 12px" }}>
        <StageBar currentStage={local.stage} onStageClick={(id) => set("stage", id)} />
      </div>

      {/* Notes preview — visible when collapsed and notes exist */}
      {project.notes && !expanded && (
        <div onClick={onToggle} style={{ margin: "0 18px 12px", padding: "10px 14px", background: "rgba(255,255,255,0.5)", border: "1px solid #e8d8c0", borderRadius: 8, cursor: "pointer" }}>
          <div style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", letterSpacing: 2, color: "#b8a888", textTransform: "uppercase", marginBottom: 5 }}>Notes</div>
          <div style={{ fontSize: 12, color: "#5a3a20", fontFamily: "Georgia, serif", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{project.notes}</div>
        </div>
      )}

      {/* Toggle */}
      <div onClick={onToggle} style={{ padding: "8px 18px 12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
        {dirty && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#b86c3088", letterSpacing: 1 }}>● UNSAVED</span>}
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#b8a888", letterSpacing: 1 }}>{expanded ? "COLLAPSE" : "EDIT / DETAILS"}</span>
        <span style={{ color: "#b8a888", fontSize: 10, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
      </div>

      {/* Expanded form */}
      {expanded && (
        <div style={{ borderTop: "1px solid #e8d8c0", padding: "20px 18px", background: "rgba(255,255,255,0.4)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 14 }}>
            <Label label="Project / Song Title"><input value={local.title} onChange={e => set("title", e.target.value)} placeholder="Enter title..." style={inputStyle} /></Label>
            <Label label="Collaborators"><input value={local.collaborators} onChange={e => set("collaborators", e.target.value)} placeholder="Producer, featured artist..." style={inputStyle} /></Label>
            <Label label="Responsible for Next Steps"><input value={local.owner} onChange={e => set("owner", e.target.value)} placeholder="Name or role..." style={inputStyle} /></Label>
            <Label label="Current Stage">
              <select value={local.stage} onChange={e => set("stage", e.target.value)} style={inputStyle}>
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Label>
          </div>

          <Label label="Notes">
            <textarea value={local.notes} onChange={e => set("notes", e.target.value)} placeholder="Session notes, references, links..." rows={3} style={{ ...inputStyle, resize: "vertical", minHeight: 70 }} />
          </Label>

          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <Label label="🎵 Latest Bounce">
              <div style={{ display: "flex", gap: 8 }}>
                <input value={local.bounce_link} onChange={e => set("bounce_link", e.target.value)} placeholder="Paste Dropbox link..." style={{ ...inputStyle, flex: 1, fontSize: 11, fontFamily: "'DM Mono', monospace" }} />
                {local.bounce_link && <a href={local.bounce_link} target="_blank" rel="noopener noreferrer" style={{ background: "#1e1008", color: "#f0e8da", borderRadius: 6, padding: "8px 12px", fontSize: 11, fontFamily: "'DM Mono', monospace", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>↗</a>}
              </div>
            </Label>
            <Label label="🖼️ Album Art / Assets">
              <div style={{ display: "flex", gap: 8 }}>
                <input value={local.assets_link} onChange={e => set("assets_link", e.target.value)} placeholder="Paste Dropbox link..." style={{ ...inputStyle, flex: 1, fontSize: 11, fontFamily: "'DM Mono', monospace" }} />
                {local.assets_link && <a href={local.assets_link} target="_blank" rel="noopener noreferrer" style={{ background: "#1e1008", color: "#f0e8da", borderRadius: 6, padding: "8px 12px", fontSize: 11, fontFamily: "'DM Mono', monospace", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>↗</a>}
              </div>
            </Label>
          </div>

          {/* Deadlines */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: 2, color: "#b8a888", textTransform: "uppercase", marginBottom: 10 }}>Stage Deadlines</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
              {STAGES.map((stage) => {
                const isCurrent = stage.id === local.stage;
                const isPast = STAGE_IDS.indexOf(stage.id) < STAGE_IDS.indexOf(local.stage);
                return (
                  <div key={stage.id} style={{ background: isCurrent ? `${stage.color}0d` : "rgba(255,255,255,0.4)", border: `1px solid ${isCurrent ? stage.color + "33" : "#e8d8c0"}`, borderRadius: 8, padding: "8px 10px", opacity: isPast ? 0.5 : 1 }}>
                    <div style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", fontWeight: 600, letterSpacing: 1, color: isCurrent ? stage.color : "#b8a888", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                      {isPast && <span style={{ color: "#7aab98" }}>✓</span>}{stage.short}
                    </div>
                    <input type="date" value={local.deadlines[stage.id] || ""} onChange={e => setDeadline(stage.id, e.target.value)}
                      style={{ ...inputStyle, padding: "3px 4px", fontSize: 10, background: "transparent", border: "none", borderBottom: `1px solid ${isCurrent ? stage.color + "44" : "#e0d0b8"}`, borderRadius: 0, color: local.deadlines[stage.id] ? "#5a3a20" : "#b8a888", width: "100%" }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
            <button onClick={onDelete}
              style={{ background: "transparent", border: "1px solid rgba(180,80,50,0.2)", color: "rgba(180,80,50,0.4)", borderRadius: 6, padding: "8px 16px", fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: 1, cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { e.target.style.background = "rgba(180,80,50,0.06)"; e.target.style.color = "#b45032"; }}
              onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "rgba(180,80,50,0.4)"; }}>
              DELETE
            </button>

            <button onClick={handleUpdate} disabled={saving}
              style={{ background: saved ? "#7aab98" : dirty ? "#b86c30" : "#c8b898", border: "none", borderRadius: 8, color: "#f0e8da", padding: "10px 28px", fontSize: 12, fontFamily: "'DM Mono', monospace", fontWeight: 600, letterSpacing: 2, cursor: saving ? "wait" : "pointer", boxShadow: dirty ? "0 4px 16px rgba(184,108,48,0.3)" : "none", transition: "all 0.2s" }}>
              {saving ? "SAVING..." : saved ? "✓ SAVED" : "UPDATE"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Label({ label, children }) {
  return <div><div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", letterSpacing: 2, color: "#b8a888", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>{children}</div>;
}

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  background: "rgba(255,255,255,0.55)",
  border: "1px solid #e0d0b8",
  borderRadius: 6, color: "#3a2010",
  padding: "9px 10px", fontSize: 13,
  fontFamily: "Georgia, serif", outline: "none",
};

function FilterBtn({ active, onClick, color, children }) {
  return (
    <button onClick={onClick} style={{ background: active ? color : "transparent", border: `1px solid ${active ? color : "#d0bfa0"}`, color: active ? "#f0e8da" : "#7a5a38", borderRadius: 20, padding: "6px 14px", fontSize: 11, fontFamily: "'DM Mono', monospace", fontWeight: 500, letterSpacing: 1, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}>{children}</button>
  );
}

export default function MusicTracker() {
  const [projects, setProjects] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (!error) setProjects(data || []);
    setLoading(false);
  };

  const addProject = async () => {
    setAdding(true);
    const { data, error } = await supabase.from("projects").insert([{ title: "", collaborators: "", stage: "idea", owner: "", notes: "", deadlines: defaultDeadlines(), bounce_link: "", assets_link: "" }]).select().single();
    if (!error && data) { await fetchProjects(); setExpanded(data.id); }
    setAdding(false);
  };

  const deleteProject = async (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    if (expanded === id) setExpanded(null);
    await supabase.from("projects").delete().eq("id", id);
  };

  const filtered = projects.filter(p => {
    const matchStage = filter === "all" || p.stage === filter;
    const matchSearch = !search || (p.title || "").toLowerCase().includes(search.toLowerCase()) || (p.collaborators || "").toLowerCase().includes(search.toLowerCase()) || (p.owner || "").toLowerCase().includes(search.toLowerCase());
    return matchStage && matchSearch;
  });

  const stageCounts = STAGE_IDS.reduce((acc, id) => ({ ...acc, [id]: projects.filter(p => p.stage === id).length }), {});

  return (
    <div style={{ minHeight: "100vh", background: "#1e1208", fontFamily: "Georgia, serif", color: "#3a2010" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", right: "-5%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(210,150,80,0.12) 0%, transparent 70%)", animation: "drift1 20s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(190,110,70,0.08) 0%, transparent 70%)", animation: "drift2 25s ease-in-out infinite" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto", padding: "32px 16px" }}>
        <div style={{ background: "#f0e8da", borderRadius: 20, padding: "clamp(24px, 5vw, 48px)", position: "relative", overflow: "hidden", boxShadow: "0 8px 48px rgba(0,0,0,0.4)" }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 85% 0%, rgba(210,150,80,0.12) 0%, transparent 55%), radial-gradient(ellipse at 5% 100%, rgba(190,110,70,0.08) 0%, transparent 50%)" }} />

          <div style={{ marginBottom: 28, position: "relative" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: 5, color: "#a07830", textTransform: "uppercase", marginBottom: 10 }}>Koastle · Studio Dashboard</div>
            <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(36px, 8vw, 64px)", fontWeight: 300, color: "#1e1008", lineHeight: 0.95, marginBottom: 14 }}>
              Music Project<br /><em style={{ fontStyle: "italic", color: "#b86c30" }}>Tracker</em>
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#7a5a38", letterSpacing: 1 }}>{projects.length} project{projects.length !== 1 ? "s" : ""} in the pipeline</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#b86c30", boxShadow: "0 0 6px #b86c3088", animation: "pulse 2s infinite" }} />
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#b86c3066", letterSpacing: 1.5 }}>LIVE SYNC</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap", alignItems: "center", position: "relative" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
              style={{ ...inputStyle, width: "min(220px, 100%)", fontSize: 12, fontFamily: "'DM Mono', monospace" }} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <FilterBtn active={filter === "all"} onClick={() => setFilter("all")} color="#b86c30">ALL ({projects.length})</FilterBtn>
              {STAGES.map(s => stageCounts[s.id] > 0 && <FilterBtn key={s.id} active={filter === s.id} onClick={() => setFilter(s.id)} color={s.color}>{s.short} ({stageCounts[s.id]})</FilterBtn>)}
            </div>
            <button onClick={addProject} disabled={adding} style={{ marginLeft: "auto", background: adding ? "#c8b898" : "#1e1008", border: "none", borderRadius: 9, color: "#f0e8da", padding: "11px 22px", fontSize: 11, fontFamily: "'DM Mono', monospace", fontWeight: 500, letterSpacing: 2, cursor: adding ? "wait" : "pointer", boxShadow: "0 4px 16px rgba(30,16,8,0.25)", whiteSpace: "nowrap" }}>{adding ? "ADDING..." : "+ NEW PROJECT"}</button>
          </div>

          <div style={{ display: "flex", marginBottom: 24, borderTop: "1px solid #d8c8a8", borderBottom: "1px solid #d8c8a8", overflowX: "auto" }}>
            {STAGES.map((stage, i) => (
              <div key={stage.id} onClick={() => setFilter(filter === stage.id ? "all" : stage.id)}
                style={{ flex: "1 0 auto", minWidth: 60, padding: "12px 4px", textAlign: "center", borderRight: i < STAGES.length - 1 ? "1px solid #e0d0b8" : "none", cursor: "pointer", background: filter === stage.id ? `${stage.color}0d` : "transparent", transition: "background 0.15s" }}>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: stageCounts[stage.id] ? stage.color : "#e0d0b8" }}>{stageCounts[stage.id]}</div>
                <div style={{ fontSize: 8, fontFamily: "'DM Mono', monospace", color: "#b8a888", letterSpacing: 0.5, marginTop: 3 }}>{stage.short}</div>
              </div>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", color: "#b8a888", padding: "60px 0", fontFamily: "'DM Mono', monospace", letterSpacing: 3, fontSize: 12 }}>LOADING...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: "#b8a888", padding: "60px 0", fontStyle: "italic", fontSize: 15 }}>No projects found. Add one above.</div>
          ) : (
            filtered.map(p => (
              <ProjectCard
                key={p.id}
                project={p}
                onDelete={() => deleteProject(p.id)}
                onRefresh={fetchProjects}
                expanded={expanded === p.id}
                onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
              />
            ))
          )}

          <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid #d8c8a8", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#b8a888", letterSpacing: 1.5 }}>GOOGLE CALENDAR · COMING SOON</span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, fontStyle: "italic", color: "#b86c3066" }}>Studio OS v2.0</span>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&family=DM+Mono:wght@300;400;500&family=Syne:wght@400;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #1e1208; }
        input::placeholder, textarea::placeholder { color: #b8a888; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: opacity(0.3); }
        select option { background: #f0e8da; color: #3a2010; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes drift1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-3%,5%)} }
        @keyframes drift2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(4%,-4%)} }
      `}</style>
    </div>
  );
}
