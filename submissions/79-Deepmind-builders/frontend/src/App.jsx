import { useState, useEffect } from "react";
import { fetchEmails, triageEmail } from "./api.js";
import Sidebar from "./components/Sidebar.jsx";
import TopBar from "./components/TopBar.jsx";
import Dashboard from "./components/Dashboard.jsx";
import InboxView from "./components/InboxView.jsx";
import DraftsView from "./components/DraftsView.jsx";
import TasksView from "./components/TasksView.jsx";
import AIRulesView from "./components/AIRulesView.jsx";
import SuggestedView from "./components/SuggestedView.jsx";
import SpamView from "./components/SpamView.jsx";
import ComposeModal from "./components/ComposeModal.jsx";
import WorkspaceModal from "./components/WorkspaceModal.jsx";

export default function App() {
  const [emails, setEmails] = useState([]);
  const [triageCache, setTriageCache] = useState({});
  const [activeView, setActiveView] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [processingAll, setProcessingAll] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);

  useEffect(() => {
    fetchEmails()
      .then(setEmails)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleTriaged = (emailId, triage) =>
    setTriageCache(prev => ({ ...prev, [emailId]: triage }));

  const handleTriageAll = async () => {
    setProcessingAll(true);
    const untriaged = emails.filter(e => !triageCache[e.id] && !e.isSpam);
    for (const email of untriaged) {
      try {
        const result = await triageEmail(email);
        setTriageCache(prev => ({ ...prev, [email.id]: result.triage }));
        await new Promise(r => setTimeout(r, 200));
      } catch (e) {
        console.error("Failed:", email.id, e);
      }
    }
    setProcessingAll(false);
  };

  const handleNavigate = (view) => {
    if (view === "compose") {
      setShowCompose(true);
      return;
    }
    setActiveView(view);
  };

  const analyzed = Object.keys(triageCache).length;

  if (loading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#faf8ff" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 44, height: 44, borderRadius: "12px", background: "linear-gradient(135deg, #3525cd, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff", margin: "0 auto 16px" }}>✦</div>
        <p style={{ fontFamily: "'Manrope',sans-serif", color: "#787594", fontSize: 13 }}>Loading workspace…</p>
      </div>
    </div>
  );

  const renderView = () => {
    switch (activeView) {
      case "dashboard": return <Dashboard emails={emails} triageCache={triageCache} onNavigate={handleNavigate} onTriageAll={handleTriageAll} processingAll={processingAll} />;
      case "inbox": return <InboxView emails={emails} triageCache={triageCache} onTriaged={handleTriaged} />;
      case "drafts": return <DraftsView emails={emails} triageCache={triageCache} />;
      case "tasks": return <TasksView emails={emails} triageCache={triageCache} />;
      case "ai-rules": return <AIRulesView />;
      case "suggested": return <SuggestedView emails={emails} triageCache={triageCache} onTriaged={handleTriaged} />;
      case "spam": return <SpamView emails={emails} />;
      default: return null;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#faf8ff", overflow: "hidden" }}>
      <Sidebar
        activeView={activeView}
        onNavigate={handleNavigate}
        onWorkspace={() => setShowWorkspace(true)}
      />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar
          activeView={activeView}
          emails={emails}
          triageCache={triageCache}
          onNavigate={handleNavigate}
        />
        {processingAll && (
          <div style={{ padding: "10px 32px", background: "linear-gradient(135deg, #3525cd, #4f46e5)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
            <span style={{ color: "#fff", fontSize: 13, fontFamily: "'Manrope',sans-serif", fontWeight: 600 }}>
              Agent processing inbox… {analyzed}/{emails.length} complete
            </span>
            <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: "9999px", marginLeft: 8 }}>
              <div style={{ height: "100%", background: "#fff", borderRadius: "9999px", width: `${(analyzed / emails.length) * 100}%`, transition: "width 0.3s" }} />
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
        <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
          {renderView()}
        </div>
      </div>

      {showCompose && <ComposeModal onClose={() => setShowCompose(false)} />}
      {showWorkspace && (
        <WorkspaceModal
          emails={emails}
          triageCache={triageCache}
          onClose={() => setShowWorkspace(false)}
        />
      )}
    </div>
  );
}
