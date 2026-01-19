import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Tickets from "./pages/Tickets";
import TicketChat from "./pages/TicketChat";
import Notifications from "./pages/Notifications";
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import Layout from "./components/Layout";

import { api } from "./api";

export default function App() {
  const [page, setPage] = useState("tickets");
  const [ticketId, setTicketId] = useState(null);
  const [notesCount, setNotesCount] = useState(0);

  const loadCount = () => {
    api("/tickets/notifications").then(data => {
      if (Array.isArray(data)) setNotesCount(data.length);
    });
  };

  useEffect(() => {
    loadCount();
    const i = setInterval(loadCount, 5000);
    return () => clearInterval(i);
  }, []);

  if (!localStorage.getItem("token")) {
    return <Login onLogin={() => setPage("tickets")} />;
  }

  function isAdmin() {
    const token = localStorage.getItem("token");
    if (!token) return false;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role === "admin";
  }

  return (
    <Layout onNav={setPage} notesCount={notesCount} isAdmin={isAdmin()}>
      {page === "tickets" && (
        <Tickets
          onOpen={id => {
            setTicketId(id);
            setPage("chat");
          }}
        />
      )}

      {page === "chat" && <TicketChat ticketId={ticketId} />}

      {page === "notifications" && <Notifications />}

      {/* Vista del panel del agente - solo para NO administradores */}
      {page === "agent" && !isAdmin() && (
        <AgentDashboard
          onOpen={id => {
            setTicketId(id);
            setPage("chat");
          }}
        />
      )}

      {page === "admin" && isAdmin() && <AdminDashboard />}
    </Layout>
  );
}