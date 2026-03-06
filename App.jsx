import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mxclokwdyvjhdzkgmybw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14Y2xva3dkeXZqaGR6a2dteWJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MzI5MzAsImV4cCI6MjA4ODQwODkzMH0.-eQeSgXq6cWEElRSi9PsmYHLbEuli7tqM0ZIa3Pvg0w";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const STAGES = [
  { id: "idea", label: "Idea Generation", short: "IDEA", color: "#9b59b6" },
  { id: "songwriting", label: "Songwriting / Arrangement", short: "WRITE", color: "#3498db" },
  { id: "vocal", label: "Vocal Recording", short: "VOCALS", color: "#1abc9c" },
  { id: "premix", label: "Pre-Mix", short: "PRE-MIX", color: "#f39c12" },
  { id: "mixing", label: "Mixing", short: "MIXING", color: "#e67e22" },
  { id: "mastering", label: "Mastering", short: "MASTER", color: "#e74c3c" },
  { id: "assets", label: "Release Assets", short: "ASSETS", color: "#e91e8c" },
  { id: "distribution", label: "Distribution", short: "DISTRO", color: "#27ae60" },
];

const STAGE_IDS = STAGES.map(s => s.id);
const defaultDeadlines = () => STAGE_IDS.reduce((acc, id) => ({ ...acc, [id]: "" }), {});

function StageBar({ currentStage, deadlines, onStageClick }) {
  const currentIdx = STAGE_IDS.indexOf(currentStage);
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "stretch", height: 28 }}>
      {STAGES.map((stage, i) => {
        const isPast = i < currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <button key={stage.id} title={`${stage.label}${deadlines[stage.id] ? " · " + deadlines[stage.id] : ""}`}
            onClick={() => onStageClick(stage.id)}
            style={{ flex: 1, background: isPast ? stage.color + "cc" : isCurrent ? stage.color : "#1a1a2e", border: isCurrent ? `2px solid ${stage.color}` : "2px solid transparent", borderRadius: 3, cursor: "pointer", transition: "all 0.15s", position: "relative", outline: "none" }}>
            {isCurrent && <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 7, fontWeight: 900, color: "#fff", letterSpacing: 0.5, whiteSpace: "nowrap", fontFamily: "'Courier New', monospace" }}>{stage.short}</span>}
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
    <div style={{ background: "linear-gradient(135deg, #12122a 0%, #1a1a3e 100%)", border: `1px solid ${currentStage.color}33`, borderLeft: `3px solid ${currentStage.color}`, borderRadius: 10, marginBottom: 12, overflow: "hidden", transition: "box-shadow 0.2s", boxShadow: expanded ? `0 0 24px ${currentStage.color}22` : "none" }}>
      <div style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }} onClick={onToggle}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontWeight: 900, fontSize: 15, color: "#fff", letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {project.title || <span style={{ color: "#555", fontStyle: "italic", textTransform: "none", fontWeight: 400 }}>Untitled Project</span>}
          </div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 2, fontFamily: "Georgia, serif" }}>
            {project.collaborators ? `w/ ${project.collaborators}` : <span style={{ color: "#444" }}>No collaborators</span>}
            {project.owner && <span style={{ marginLeft: 10, color: currentStage.color + "cc" }}>→ {project.owner}</span>}
          </div>
        </div>
        <div style={{ background: currentStage.color + "22", border: `1px solid ${currentStage.color}55`, color: currentStage.color, borderRadius: 20, padding: "3px 10px", fontSize: 10, fontFamily: "'Courier New', monospace", fontWeight: 900, letterSpacing: 1, whiteSpace: "nowrap" }}>{currentStage.short}</div>
        <div style={{ color: "#555", fontSize: 12, transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</div>
      </div>
      <div style={{ padding: "0 18px 12px" }}>
        <StageBar currentStage={project.stage} deadlines={deadlines} onStageClick={(id) => handleField("stage", id)} />
      </div>
      {expanded && (
        <div style={{ borderTop: "1px solid #ffffff0a", padding: "18px 18px 20px" }}>
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
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: 2, color: "#555", textTransform: "uppercase", marginBottom: 10 }}>Stage Deadlines</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {STAGES.map((stage) => {
                const isCurrent = stage.id === project.stage;
                const isPast = STAGE_IDS.indexOf(stage.id) < STAGE_IDS.indexOf(project.stage);
                return (
                  <div key={stage.id} style={{ background: isCurrent ? stage.color + "15" : "#0d0d20", border: `1px solid ${isCurrent ? stage.color + "44" : "#ffffff08"}`, borderRadius: 6, padding: "8px 10px", opacity: isPast ? 0.5 : 1 }}>
                    <div style={{ fontSize: 9, fontFamily: "'Courier New', monospace", fontWeight: 900, letterSpacing: 1, color: isCurrent ? stage.color : "#444", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>{isPast && <span>✓</span>}{stage.short}</div>
                    <input type="date" value={deadlines[stage.id] || ""} onChange={e => handleDeadline(stage.id, e.target.value)} style={{ ...inputStyle, padding: "3px 5px", fontSize: 10, background: "transparent", border: "none", borderBottom: `1px solid ${isCurrent ? stage.color + "55" : "#333"}`, borderRadius: 0, color: deadlines[stage.id] ? "#ccc" : "#444", width: "100%" }} />
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button onClick={onDelete} style={{ background: "transparent", border: "1px solid #e74c3c44", color: "#e74c3c88", borderRadius: 6, padding: "5px 14px", fontSize: 11, fontFamily: "'Courier New', monospace", letterSpacing: 1, cursor: "pointer" }}
              onMouseEnter={e => { e.target.style.background = "#e74c3c22"; e.target.style.color = "#e74c3c"; }}
              onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#e74c3c88"; }}>DELETE</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Label({ label, children }) {
  return <div><div style={{ fontSize: 9, fontFamily: "'Courier New', monospace", letterSpacing: 1.5, color: "#555", textTransform: "uppercase", marginBottom: 5 }}>{label}</div>{children}</div>;
}

const inputStyle = { width: "100%", boxSizing: "border-box", background: "#0d0d20", border: "1px solid #ffffff12", borderRadius: 6, color: "#ddd", padding: "8px 10px", fontSize: 13, fontFamily: "Georgia, serif", outline: "none" };

function Input({ value, onChange, placeholder }) {
  return <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />;
}

function FilterBtn({ active, onClick, color, children }) {
  return <button onClick={onClick} style={{ background: active ? color + "22" : "transparent", border: `1px solid ${active ? color + "88" : "#ffffff12"}`, color: active ? color : "#555", borderRadius: 20, padding: "4px 10px", fontSize: 9, fontFamily: "'Courier New', monospace", fontWeight: 900, letterSpacing: 1, cursor: "pointer", whiteSpace: "nowrap" }}>{children}</button>;
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
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => { fetchProjects(); })
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
    if (!error && data) setExpanded(data.id);
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
    <div style={{ minHeight: "100vh", background: "#080812", fontFamily: "Georgia, serif", color: "#ccc" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: 6, color: "#e91e8c", textTransform: "uppercase", marginBottom: 8 }}>Studio Dashboard</div>
          <h1 style={{ margin: 0, fontSize: 38, fontWeight: 400, color: "#fff", letterSpacing: -1, lineHeight: 1.1 }}>Music Project<br /><span style={{ color: "#e91e8c", fontStyle: "italic" }}>Tracker</span></h1>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12 }}>
            <p style={{ color: "#555", fontSize: 13, margin: 0, fontStyle: "italic" }}>{projects.length} project{projects.length !== 1 ? "s" : ""} in the pipeline</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#27ae60", boxShadow: "0 0 6px #27ae60", animation: "pulse 2s infinite" }} />
              <span style={{ fontSize: 10, fontFamily: "'Courier New', monospace", color: "#27ae6088", letterSpacing: 1 }}>LIVE SYNC</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." style={{ ...inputStyle, width: 220, fontSize: 12 }} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <FilterBtn active={filter === "all"} onClick={() => setFilter("all")} color="#e91e8c">ALL ({projects.length})</FilterBtn>
            {STAGES.map(s => stageCounts[s.id] > 0 && <FilterBtn key={s.id} active={filter === s.id} onClick={() => setFilter(s.id)} color={s.color}>{s.short} ({stageCounts[s.id]})</FilterBtn>)}
          </div>
          <button onClick={addProject} disabled={saving} style={{ marginLeft: "auto", background: saving ? "#333" : "linear-gradient(135deg, #e91e8c, #9b59b6)", border: "none", borderRadius: 8, color: "#fff", padding: "9px 20px", fontSize: 12, fontFamily: "'Courier New', monospace", fontWeight: 900, letterSpacing: 2, cursor: saving ? "wait" : "pointer", whiteSpace: "nowrap" }}>{saving ? "SAVING..." : "+ NEW PROJECT"}</button>
        </div>

        <div style={{ display: "flex", marginBottom: 28, border: "1px solid #ffffff08", borderRadius: 10, overflow: "hidden" }}>
          {STAGES.map((stage, i) => (
            <div key={stage.id} onClick={() => setFilter(filter === stage.id ? "all" : stage.id)} style={{ flex: 1, padding: "10px 4px", textAlign: "center", background: filter === stage.id ? stage.color + "22" : "transparent", borderRight: i < STAGES.length - 1 ? "1px solid #ffffff08" : "none", cursor: "pointer" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: stageCounts[stage.id] ? stage.color : "#2a2a4a" }}>{stageCounts[stage.id]}</div>
              <div style={{ fontSize: 8, fontFamily: "'Courier New', monospace", letterSpacing: 0.5, color: "#444", marginTop: 2 }}>{stage.short}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: "#555", padding: "60px 0", fontStyle: "italic", fontFamily: "'Courier New', monospace", letterSpacing: 2 }}>LOADING...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: "#333", padding: "60px 0", fontStyle: "italic" }}>No projects found. Add one above.</div>
        ) : (
          filtered.map(p => <ProjectCard key={p.id} project={p} onUpdate={updateProject} onDelete={() => deleteProject(p.id)} expanded={expanded === p.id} onToggle={() => setExpanded(expanded === p.id ? null : p.id)} />)
        )}

        <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid #ffffff08", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#333", fontFamily: "'Courier New', monospace", letterSpacing: 1 }}>GOOGLE CALENDAR INTEGRATION · COMING SOON</span>
          <span style={{ fontSize: 10, color: "#e91e8c55", fontFamily: "'Courier New', monospace" }}>◈ STUDIO OS v2.0</span>
        </div>
      </div>
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
}
