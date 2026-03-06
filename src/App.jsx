import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mxclokwdyvjhdzkgmybw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14Y2xva3dkeXZqaGR6a2dteWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MzI5MzAsImV4cCI6MjA4ODQwODkzMH0.-eQeSgXq6cWEElRSi9PsmYHLbEuli7tqM0ZIa3Pvg0w";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const STAGES = [
  { id: "idea",         label: "Idea Generation",          short: "IDEA",    color: "#a8d8ea" },
  { id: "songwriting",  label: "Songwriting / Arrangement", short: "WRITE",   color: "#00BFDF" },
  { id: "vocal",        label: "Vocal Recording",           short: "VOCALS",  color: "#7eccd6" },
  { id: "premix",       label: "Pre-Mix",                   short: "PRE-MIX", color: "#F9C784" },
  { id: "mixing",       label: "Mixing",                    short: "MIXING",  color: "#f7a66c" },
  { id: "mastering",    label: "Mastering",                 short: "MASTER",  color: "#F4A7C3" },
  { id: "assets",       label: "Release Assets",            short: "ASSETS",  color: "#e8c4d8" },
  { id: "distribution", label: "Distribution",              short: "DISTRO",  color: "#88d8b0" },
];

const STAGE_IDS = STAGES.map(s => s.id);
const defaultDeadlines = () => STAGE_IDS.reduce((acc, id) => ({ ...acc, [id]: "" }), {});

function StageBar({ currentStage, deadlines, onStageClick }) {
  const currentIdx = STAGE_IDS.indexOf(currentStage);
  return (
    <div style={{ display: "flex", gap: 2, height: 24 }}>
      {STAGES.map((stage, i) => {
        const isPast = i < currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <button key={stage.id}
            title={`${stage.label}${deadlines[stage.id] ? " · " + deadlines[stage.id] : ""}`}
            onClick={() => onStageClick(stage.id)}
            style={{
              flex: 1,
              background: isPast ? stage.color + "99" : isCurrent ? stage.color : "#0d1f2d",
              border: isCurrent ? `2px solid ${stage.color}` : "2px solid transparent",
              borderRadius: 3, cursor: "pointer", transition: "all 0.15s",
              position: "relative", outline: "none",
            }}>
            {isCurrent && (
              <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 7, fontWeight: 900, color: "#000", letterSpacing: 0.5, whiteSpace: "nowrap", fontFamily: "'Courier New', monospace" }}>{stage.short}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ProjectCard({ project, onUpdate, onDelete, expanded, onToggle }) {
  const currentStage = STAGES.find(s => s.id === project.stage) || STAGES[0];
  const deadlines = project.deadlines || defaultDeadlines();
  const handleField = (field, value) => onUpdate({ ...project, [field]: value });
  const handleDeadline = (stageId, value) => onUpdate({ ...project, deadlines: { ...deadlines, [stageId]: value } });

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(0,191,223,0.06) 0%, rgba(244,167,195,0.06) 50%, rgba(249,199,132,0.04) 100%)",
      backdropFilter: "blur(12px)",
      border: `1px solid ${currentStage.color}30`,
      borderLeft: `3px solid ${currentStage.color}`,
      borderRadius: 14, marginBottom: 10, overflow: "hidden",
      transition: "box-shadow 0.3s",
      boxShadow: expanded ? `0 0 40px ${currentStage.color}15, 0 4px 24px rgba(0,0,0,0.4)` : "0 2px 16px rgba(0,0,0,0.3)",
    }}>
      <div style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }} onClick={onToggle}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 900, fontSize: 14, color: "#e8f6fa", letterSpacing: 1.5, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {project.title || <span style={{ color: "#1a3a4a", fontStyle: "italic", textTransform: "none", fontWeight: 400 }}>Untitled Project</span>}
          </div>
          <div style={{ fontSize: 11, color: "#4a8a9a", marginTop: 3, fontFamily: "Georgia, serif" }}>
            {project.collaborators ? `w/ ${project.collaborators}` : <span style={{ color: "#1a3a4a" }}>No collaborators</span>}
            {project.owner && <span style={{ marginLeft: 10, color: currentStage.color + "cc" }}>→ {project.owner}</span>}
          </div>
        </div>
        <div style={{
          background: `linear-gradient(135deg, ${currentStage.color}22, ${currentStage.color}11)`,
          border: `1px solid ${currentStage.color}44`,
          color: currentStage.color, borderRadius: 20, padding: "3px 12px",
          fontSize: 9, fontFamily: "'Courier New', monospace", fontWeight: 900, letterSpacing: 1.5, whiteSpace: "nowrap",
        }}>{currentStage.short}</div>
        <div style={{ color: "#2a5a6a", fontSize: 11, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</div>
      </div>

      <div style={{ padding: "0 18px 14px" }}>
        <StageBar currentStage={project.stage} deadlines={deadlines} onStageClick={(id) => handleField("stage", id)} />
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid rgba(0,191,223,0.08)", padding: "18px 18px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
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
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 2, color: "#2a5a6a", textTransform: "uppercase", marginBottom: 10 }}>Stage Deadlines</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {STAGES.map((stage) => {
                const isCurrent = stage.id === project.stage;
                const isPast = STAGE_IDS.indexOf(stage.id) < STAGE_IDS.indexOf(project.stage);
                return (
                  <div key={stage.id} style={{
                    background: isCurrent ? `linear-gradient(135deg, ${stage.color}12, ${stage.color}06)` : "rgba(0,0,0,0.2)",
                    border: `1px solid ${isCurrent ? stage.color + "33" : "rgba(255,255,255,0.04)"}`,
                    borderRadius: 8, padding: "8px 10px", opacity: isPast ? 0.45 : 1,
                  }}>
                    <div style={{ fontSize: 9, fontFamily: "'Courier New', monospace", fontWeight: 900, letterSpacing: 1, color: isCurrent ? stage.color : "#1a3a4a", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                      {isPast && <span style={{ color: "#88d8b0" }}>✓</span>}{stage.short}
                    </div>
                    <input type="date" value={deadlines[stage.id] || ""} onChange={e => handleDeadline(stage.id, e.target.value)}
                      style={{ ...inputStyle, padding: "3px 5px", fontSize: 10, background: "transparent", border: "none", borderBottom: `1px solid ${isCurrent ? stage.color + "44" : "rgba(255,255,255,0.06)"}`, borderRadius: 0, color: deadlines[stage.id] ? "#a8d8ea" : "#1a3a4a", width: "100%" }} />
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button onClick={onDelete}
              style={{ background: "transparent", border: "1px solid rgba(244,167,195,0.2)", color: "rgba(244,167,195,0.4)", borderRadius: 6, padding: "5px 14px", fontSize: 11, fontFamily: "'Courier New', monospace", letterSpacing: 1, cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { e.target.style.background = "rgba(244,167,195,0.08)"; e.target.style.color = "#F4A7C3"; }}
              onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "rgba(244,167,195,0.4)"; }}>DELETE</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Label({ label, children }) {
  return <div><div style={{ fontSize: 9, fontFamily: "'Courier New', monospace", letterSpacing: 2, color: "#2a5a6a", textTransform: "uppercase", marginBottom: 5 }}>{label}</div>{children}</div>;
}

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  background: "rgba(0,0,0,0.25)",
  border: "1px solid rgba(0,191,223,0.12)",
  borderRadius: 6, color: "#a8d8ea",
  padding: "8px 10px", fontSize: 13,
  fontFamily: "Georgia, serif", outline: "none",
};

function Input({ value, onChange, placeholder }) {
  return <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />;
}

function FilterBtn({ active, onClick, color, children }) {
  return (
    <button onClick={onClick} style={{
      background: active ? color + "18" : "transparent",
      border: `1px solid ${active ? color + "66" : "rgba(255,255,255,0.06)"}`,
      color: active ? color : "#2a5a6a", borderRadius: 20, padding: "4px 12px",
      fontSize: 9, fontFamily: "'Courier New', monospace", fontWeight: 900,
      letterSpacing: 1, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
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
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "Georgia, serif", color: "#a8d8ea", position: "relative", overflow: "hidden" }}>

      {/* Iridescent background orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "60vw", height: "60vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,191,223,0.08) 0%, transparent 70%)", animation: "drift1 18s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "30%", right: "-15%", width: "50vw", height: "50vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(244,167,195,0.07) 0%, transparent 70%)", animation: "drift2 22s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "30%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(249,199,132,0.05) 0%, transparent 70%)", animation: "drift3 26s ease-in-out infinite" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,191,223,0.03) 0%, transparent 40%, rgba(244,167,195,0.03) 100%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "48px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, letterSpacing: 6, color: "#00BFDF", textTransform: "uppercase", marginBottom: 10, opacity: 0.7 }}>Koastle · Studio Dashboard</div>
          <h1 style={{ margin: 0, fontSize: 42, fontWeight: 300, color: "#e8f6fa", letterSpacing: -1, lineHeight: 1.1, fontFamily: "Georgia, serif" }}>
            Music Project<br />
            <span style={{ fontStyle: "italic", background: "linear-gradient(135deg, #00BFDF, #F4A7C3, #F9C784)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Tracker</span>
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14 }}>
            <p style={{ color: "#2a6a7a", fontSize: 13, margin: 0, fontStyle: "italic" }}>{projects.length} project{projects.length !== 1 ? "s" : ""} in the pipeline</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#88d8b0", boxShadow: "0 0 8px #88d8b0", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 9, fontFamily: "'Courier New', monospace", color: "#88d8b055", letterSpacing: 1.5 }}>LIVE SYNC</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
            style={{ ...inputStyle, width: 220, fontSize: 12, border: "1px solid rgba(0,191,223,0.15)" }} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <FilterBtn active={filter === "all"} onClick={() => setFilter("all")} color="#00BFDF">ALL ({projects.length})</FilterBtn>
            {STAGES.map(s => stageCounts[s.id] > 0 && (
              <FilterBtn key={s.id} active={filter === s.id} onClick={() => setFilter(s.id)} color={s.color}>{s.short} ({stageCounts[s.id]})</FilterBtn>
            ))}
          </div>
          <button onClick={addProject} disabled={saving} style={{
            marginLeft: "auto",
            background: saving ? "rgba(0,0,0,0.3)" : "linear-gradient(135deg, #00BFDF, #7eccd6, #F4A7C3)",
            border: "none", borderRadius: 10, color: saving ? "#2a5a6a" : "#fff",
            padding: "10px 22px", fontSize: 11, fontFamily: "'Courier New', monospace",
            fontWeight: 900, letterSpacing: 2, cursor: saving ? "wait" : "pointer",
            whiteSpace: "nowrap", boxShadow: saving ? "none" : "0 4px 20px rgba(0,191,223,0.25)",
            transition: "all 0.2s",
          }}>{saving ? "SAVING..." : "+ NEW PROJECT"}</button>
        </div>

        {/* Pipeline bar */}
        <div style={{ display: "flex", marginBottom: 28, borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,191,223,0.08)", background: "rgba(0,0,0,0.2)" }}>
          {STAGES.map((stage, i) => (
            <div key={stage.id} onClick={() => setFilter(filter === stage.id ? "all" : stage.id)}
              style={{ flex: 1, padding: "10px 4px", textAlign: "center", background: filter === stage.id ? stage.color + "15" : "transparent", borderRight: i < STAGES.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", cursor: "pointer", transition: "background 0.15s" }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: stageCounts[stage.id] ? stage.color : "#0d2535" }}>{stageCounts[stage.id]}</div>
              <div style={{ fontSize: 7, fontFamily: "'Courier New', monospace", letterSpacing: 0.5, color: "#1a3a4a", marginTop: 2 }}>{stage.short}</div>
            </div>
          ))}
        </div>

        {/* Projects */}
        {loading ? (
          <div style={{ textAlign: "center", color: "#1a3a4a", padding: "60px 0", fontFamily: "'Courier New', monospace", letterSpacing: 3, fontSize: 11 }}>LOADING...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: "#1a3a4a", padding: "60px 0", fontStyle: "italic" }}>No projects found. Add one above.</div>
        ) : (
          filtered.map(p => <ProjectCard key={p.id} project={p} onUpdate={updateProject} onDelete={() => deleteProject(p.id)} expanded={expanded === p.id} onToggle={() => setExpanded(expanded === p.id ? null : p.id)} />)
        )}

        {/* Footer */}
        <div style={{ marginTop: 48, paddingTop: 20, borderTop: "1px solid rgba(0,191,223,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 9, color: "#0d2535", fontFamily: "'Courier New', monospace", letterSpacing: 1.5 }}>GOOGLE CALENDAR · COMING SOON</span>
          <span style={{ fontSize: 9, fontFamily: "'Courier New', monospace", background: "linear-gradient(135deg, #00BFDF, #F4A7C3)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>◈ STUDIO OS v2.0</span>
        </div>
      </div>

      <style>{`
        :root { --bg: #050d12; }
        * { box-sizing: border-box; }
        body { background: #050d12; margin: 0; }
        input::placeholder, textarea::placeholder { color: #1a3a4a; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.3) sepia(1) saturate(2) hue-rotate(160deg); }
        select option { background: #0a1f2d; color: #a8d8ea; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
        @keyframes drift1 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(3%, 5%) scale(1.05); } }
        @keyframes drift2 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-4%, -3%) scale(1.08); } }
        @keyframes drift3 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(2%, -4%) scale(1.03); } }
      `}</style>
    </div>
  );
}

const BG = "#050d12";
