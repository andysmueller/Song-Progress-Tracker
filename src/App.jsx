import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mxclokwdyvjhdzkgmybw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14Y2xva3dkeXZqaGR6a2dteWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MzI5MzAsImV4cCI6MjA4ODQwODkzMH0.-eQeSgXq6cWEElRSi9PsmYHLbEuli7tqM0ZIa3Pvg0w";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const STAGES = [
  { id: "idea",         label: "Idea Generation",          short: "IDEA",    color: "#c8905a" },
  { id: "songwriting",  label: "Songwriting / Arrangement", short: "WRITE",   color: "#b86c30" },
  { id: "vocal",        label: "Vocal Recording",           short: "VOCALS",  color: "#a07848" },
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
    if (deadlines[id]) {
      return { stageId: id, stage: STAGES[i], date: deadlines[id] };
    }
  }
  return null;
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function StageBar({ currentStage, deadlines, onStageClick }) {
  const currentIdx = STAGE_IDS.indexOf(currentStage);
  return (
    <div style={{ display: "flex", gap: 2, height: 5, marginTop: 14 }}>
      {STAGES.map((stage, i) => {
        const isPast = i < currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <button key={stage.id}
            title={`${stage.label}${deadlines?.[stage.id] ? " · " + deadlines[stage.id] : ""}`}
            onClick={() => onStageClick(stage.id)}
            style={{
              flex: 1,
              background: isPast ? "#b86c3055" : isCurrent ? "#b86c30" : "#e8d8c0",
              border: "none", borderRadius: 2, cursor: "pointer", outline: "none",
              transition: "all 0.15s",
            }} />
        );
      })}
    </div>
  );
}

function ProjectCard({ project, onUpdate, onDelete, expanded, onToggle }) {
  const currentStage = STAGES.find(s => s.id === project.stage) || STAGES[0];
  const deadlines = project.deadlines || defaultDeadlines();
  const nextDeadline = getNextDeadline(project);
  const handleField = (field, value) => onUpdate({ ...project, [field]: value });
  const handleDeadline = (stageId, value) => onUpdate({ ...project, deadlines: { ...deadlines, [stageId]: value } });

  return (
    <div style={{
      background: "rgba(255,255,255,0.6)",
      border: `1px solid #ddd0b8`,
      borderLeft: `3px solid ${currentStage.color}`,
      borderRadius: 12, marginBottom: 10, overflow: "hidden",
      backdropFilter: "blur(6px)",
      boxShadow: expanded ? "0 4px 24px rgba(30,16,8,0.1)" : "0 2px 8px rgba(30,16,8,0.06)",
      transition: "box-shadow 0.2s",
    }}>
      {/* Collapsed header */}
      <div style={{ padding: "16px 18px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 14 }} onClick={onToggle}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: "#1e1008", letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {project.title || <span style={{ color: "#c8b898", fontStyle: "italic", textTransform: "none", fontWeight: 400, fontFamily: "Georgia, serif" }}>Untitled Project</span>}
          </div>
          <div style={{ fontSize: 10, color: "#a08060", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
            {project.collaborators ? `w/ ${project.collaborators}` : <span style={{ color: "#c8b898" }}>No collaborators</span>}
            {project.owner && <span style={{ marginLeft: 10, color: currentStage.color }}>→ {project.owner}</span>}
          </div>
        </div>

        {/* Right side: tag + deadline */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <div style={{ background: `${currentStage.color}18`, border: `1px solid ${currentStage.color}33`, color: currentStage.color, borderRadius: 20, padding: "3px 11px", fontSize: 9, fontFamily: "'DM Mono', monospace", fontWeight: 500, letterSpacing: 1 }}>
            {currentStage.short}
          </div>
          {nextDeadline && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: `${currentStage.color}0d`, border: `1px solid ${currentStage.color}22`, borderRadius: 6, padding: "3px 9px" }}>
              <span style={{ fontSize: 9 }}>📅</span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#a08060" }}>
                {nextDeadline.stage.short} due <strong style={{ color: currentStage.color, fontWeight: 500 }}>{formatDate(nextDeadline.date)}</strong>
              </span>
            </div>
          )}
        </div>

        <div style={{ color: "#c8b898", fontSize: 10, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s", marginTop: 2 }}>▼</div>
      </div>

      {/* Stage progress bar */}
      <div style={{ padding: "0 18px 14px" }}>
        <StageBar currentStage={project.stage} deadlines={deadlines} onStageClick={(id) => handleField("stage", id)} />
      </div>

      {/* Expanded form */}
      {expanded && (
        <div style={{ borderTop: "1px solid #e8d8c0", padding: "20px 18px 20px", background: "rgba(255,255,255,0.4)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <Label label="Project / Song Title"><Input value={project.title} onChange={v => handleField("title", v)} placeholder="Enter title..." /></Label>
            <Label label="Collaborators"><Input value={project.collaborators} onChange={v => handleField("collaborators", v)} placeholder="Producer, featured artist..." /></Label>
            <Label label="Responsible for Next Steps"><Input value={project.owner} onChange={v => handleField("owner", v)} placeholder="Name or role..." /></Label>
            <Label label="Current Stage">
              <select value={project.stage} onChange={e => handleField("stage", e.target.value)} style={inputStyle}>
                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Label>
          </div>
          <Label label="Notes">
            <textarea value={project.notes} onChange={e => handleField("notes", e.target.value)} placeholder="Session notes, references, links..." rows={2} style={{ ...inputStyle, resize: "vertical", minHeight: 52 }} />
          </Label>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: 2, color: "#c8b898", textTransform: "uppercase", marginBottom: 10 }}>Stage Deadlines</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {STAGES.map((stage) => {
                const isCurrent = stage.id === project.stage;
                const isPast = STAGE_IDS.indexOf(stage.id) < STAGE_IDS.indexOf(project.stage);
                return (
                  <div key={stage.id} style={{ background: isCurrent ? `${stage.color}0d` : "rgba(255,255,255,0.4)", border: `1px solid ${isCurrent ? stage.color + "33" : "#e8d8c0"}`, borderRadius: 8, padding: "8px 10px", opacity: isPast ? 0.5 : 1 }}>
                    <div style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", fontWeight: 500, letterSpacing: 1, color: isCurrent ? stage.color : "#c8b898", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                      {isPast && <span style={{ color: "#7aab98" }}>✓</span>}{stage.short}
                    </div>
                    <input type="date" value={deadlines[stage.id] || ""} onChange={e => handleDeadline(stage.id, e.target.value)}
                      style={{ ...inputStyle, padding: "3px 5px", fontSize: 10, background: "transparent", border: "none", borderBottom: `1px solid ${isCurrent ? stage.color + "44" : "#e0d0b8"}`, borderRadius: 0, color: deadlines[stage.id] ? "#5a3a20" : "#c8b898", width: "100%" }} />
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button onClick={onDelete}
              style={{ background: "transparent", border: "1px solid rgba(180,80,50,0.2)", color: "rgba(180,80,50,0.4)", borderRadius: 6, padding: "5px 14px", fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: 1, cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { e.target.style.background = "rgba(180,80,50,0.06)"; e.target.style.color = "#b45032"; }}
              onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "rgba(180,80,50,0.4)"; }}>DELETE</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Label({ label, children }) {
  return <div><div style={{ fontSize: 9, fontFamily: "'DM Mono', monospace", letterSpacing: 2, color: "#c8b898", textTransform: "uppercase", marginBottom: 5 }}>{label}</div>{children}</div>;
}

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  background: "rgba(255,255,255,0.5)",
  border: "1px solid #e0d0b8",
  borderRadius: 6, color: "#3a2010",
  padding: "8px 10px", fontSize: 13,
  fontFamily: "Georgia, serif", outline: "none",
};

function Input({ value, onChange, placeholder }) {
  return <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />;
}

function FilterBtn({ active, onClick, color, children }) {
  return (
    <button onClick={onClick} style={{
      background: active ? color : "transparent",
      border: `1px solid ${active ? color : "#d0bfa0"}`,
      color: active ? "#f0e8da" : "#a08060",
      borderRadius: 20, padding: "5px 13px",
      fontSize: 9, fontFamily: "'DM Mono', monospace",
      fontWeight: 500, letterSpacing: 1, cursor: "pointer", whiteSpace: "nowrap",
      transition: "all 0.15s",
    }}>{children}</button>
  );
}

export default function MusicTracker() {
  const [projects, setProjects] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProjects();
    const channel = supabase.channel("projects-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => fetchProjects())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (!error) setProjects(data || []);
    setLoading(false);
  };

  const addProject = async () => {
    setSaving(true);
    const { data, error } = await supabase.from("projects").insert([{ title: "", collaborators: "", stage: "idea", owner: "", notes: "", deadlines: defaultDeadlines() }]).select().single();
    if (!error && data) { await fetchProjects(); setExpanded(data.id); }
    setSaving(false);
  };

  const updateProject = async (updated) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    await supabase.from("projects").update({ title: updated.title, collaborators: updated.collaborators, stage: updated.stage, owner: updated.owner, notes: updated.notes, deadlines: updated.deadlines }).eq("id", updated.id);
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
    <div style={{ minHeight: "100vh", background: "#1e1208", fontFamily: "Georgia, serif", color: "#3a2010", position: "relative" }}>

      {/* Warm background glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", right: "-5%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(210,150,80,0.12) 0%, transparent 70%)", animation: "drift1 20s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "-5%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(190,110,70,0.08) 0%, transparent 70%)", animation: "drift2 25s ease-in-out infinite" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "48px 20px" }}>

        {/* Main content card */}
        <div style={{ background: "#f0e8da", borderRadius: 20, padding: "48px", position: "relative", overflow: "hidden", boxShadow: "0 8px 48px rgba(0,0,0,0.4)" }}>
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 85% 0%, rgba(210,150,80,0.12) 0%, transparent 55%), radial-gradient(ellipse at 5% 100%, rgba(190,110,70,0.08) 0%, transparent 50%)" }} />

          {/* Header */}
          <div style={{ marginBottom: 32, position: "relative" }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: 5, color: "#c4a070", textTransform: "uppercase", marginBottom: 12 }}>Koastle · Studio Dashboard</div>
            <h1 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: 54, fontWeight: 300, color: "#1e1008", lineHeight: 0.95, marginBottom: 16 }}>
              Music Project<br /><em style={{ fontStyle: "italic", color: "#b86c30" }}>Tracker</em>
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#a08060", letterSpacing: 1 }}>{projects.length} project{projects.length !== 1 ? "s" : ""} in the pipeline</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#b86c30", boxShadow: "0 0 6px #b86c3088", animation: "pulse 2s infinite" }} />
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#b86c3055", letterSpacing: 1.5 }}>LIVE SYNC</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap", alignItems: "center", position: "relative" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
              style={{ ...inputStyle, width: 220, fontSize: 11, fontFamily: "'DM Mono', monospace" }} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <FilterBtn active={filter === "all"} onClick={() => setFilter("all")} color="#b86c30">ALL ({projects.length})</FilterBtn>
              {STAGES.map(s => stageCounts[s.id] > 0 && (
                <FilterBtn key={s.id} active={filter === s.id} onClick={() => setFilter(s.id)} color={s.color}>{s.short} ({stageCounts[s.id]})</FilterBtn>
              ))}
            </div>
            <button onClick={addProject} disabled={saving} style={{
              marginLeft: "auto", background: saving ? "#c8b898" : "#1e1008",
              border: "none", borderRadius: 9, color: "#f0e8da",
              padding: "10px 22px", fontSize: 10, fontFamily: "'DM Mono', monospace",
              fontWeight: 500, letterSpacing: 2, cursor: saving ? "wait" : "pointer",
              boxShadow: "0 4px 16px rgba(30,16,8,0.25)", whiteSpace: "nowrap",
            }}>{saving ? "SAVING..." : "+ NEW PROJECT"}</button>
          </div>

          {/* Pipeline */}
          <div style={{ display: "flex", marginBottom: 28, borderTop: "1px solid #d8c8a8", borderBottom: "1px solid #d8c8a8", position: "relative" }}>
            {STAGES.map((stage, i) => (
              <div key={stage.id} onClick={() => setFilter(filter === stage.id ? "all" : stage.id)}
                style={{ flex: 1, padding: "14px 4px", textAlign: "center", borderRight: i < STAGES.length - 1 ? "1px solid #e0d0b8" : "none", cursor: "pointer", background: filter === stage.id ? `${stage.color}0d` : "transparent", transition: "background 0.15s" }}>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: stageCounts[stage.id] ? stage.color : "#e0d0b8" }}>{stageCounts[stage.id]}</div>
                <div style={{ fontSize: 7, fontFamily: "'DM Mono', monospace", color: "#c8b898", letterSpacing: 0.5, marginTop: 3 }}>{stage.short}</div>
              </div>
            ))}
          </div>

          {/* Projects */}
          {loading ? (
            <div style={{ textAlign: "center", color: "#c8b898", padding: "60px 0", fontFamily: "'DM Mono', monospace", letterSpacing: 3, fontSize: 11 }}>LOADING...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: "#c8b898", padding: "60px 0", fontStyle: "italic", fontFamily: "Georgia, serif" }}>No projects found. Add one above.</div>
          ) : (
            filtered.map(p => <ProjectCard key={p.id} project={p} onUpdate={updateProject} onDelete={() => deleteProject(p.id)} expanded={expanded === p.id} onToggle={() => setExpanded(expanded === p.id ? null : p.id)} />)
          )}

          {/* Footer */}
          <div style={{ marginTop: 36, paddingTop: 18, borderTop: "1px solid #d8c8a8", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#c8b898", letterSpacing: 1.5 }}>GOOGLE CALENDAR · COMING SOON</span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, fontStyle: "italic", color: "#b86c3066" }}>Studio OS v2.0</span>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,300;1,400&family=DM+Mono:wght@300;400;500&family=Syne:wght@400;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #1e1208; }
        input::placeholder, textarea::placeholder { color: #c8b898; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: opacity(0.3); }
        select option { background: #f0e8da; color: #3a2010; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes drift1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-3%,5%)} }
        @keyframes drift2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(4%,-4%)} }
      `}</style>
    </div>
  );
}
