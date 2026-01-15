import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./components/Dashboard";
import Layout from "./components/Layout";
import Conflicts from "./components/Conflicts";

function App() {
  const [user, setUser] = useState(null);
  const [trains, setTrains] = useState([]);
  const [page, setPage] = useState("dashboard");

  /* ============================
     AI RESOLUTION HANDLERS
     ============================ */
  function handleAcceptResolution(trainId) {
    setTrains(prev =>
      prev.map(t =>
        t.train_id === trainId
          ? { ...t, delay: 0, status: "ON TIME" }
          : t
      )
    );
  }

  function handleRejectResolution(trainId) {
    setTrains(prev =>
      prev.map(t =>
        t.train_id === trainId
          ? { ...t, status: "DELAYED" }
          : t
      )
    );
  }

  if (!user) return <Login onLogin={setUser} />;

  return (
    <Layout setPage={setPage}>
      {page === "dashboard" && (
        <Dashboard trains={trains} setTrains={setTrains} />
      )}

      {page === "conflicts" && (
        <Conflicts
          trains={trains}
          onAcceptResolution={handleAcceptResolution}
          onRejectResolution={handleRejectResolution}
        />
      )}
    </Layout>
  );
}

export default App;
