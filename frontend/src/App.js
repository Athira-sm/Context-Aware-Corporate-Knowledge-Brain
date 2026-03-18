import Chat from "./components/Chat";
import React, { useState } from "react";
import Landing from "./components/Landing"
export default function App() {
   const [start, setStart] = useState(false);
    if (!start) { 
      return <Landing startApp={() => setStart(true)} />; 
    }
     return <Chat />; }