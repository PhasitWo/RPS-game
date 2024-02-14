import { useState } from "react";
import "./App.css";
import Home from "./Home.jsx";
import Battle from "./Battle.jsx";

function App() {
    const [page, setPage] = useState("Home");
    
    return (
        <>
            <div className="navbar">
                <button onClick={() => setPage("Home")}>Home</button>
                <button onClick={() => setPage("Battle")}>Battle</button>
            </div>
            <div className="content">
                {page === "Home" && <Home setPage={setPage} />}
                {page === "Battle" && <Battle />}
            </div>
        </>
    );
}

export default App;
