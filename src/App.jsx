import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./components/Dashboard";
import Layout from "./components/Layout";

function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <Layout>
      <Dashboard user={user} />
    </Layout>
  );
}

export default App;
