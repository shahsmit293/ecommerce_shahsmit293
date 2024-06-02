import { Context } from '../store/appContext';
import '../styles/App.css';
import React, { useContext, useState } from "react";

const App = () => {
  const [name, setValue] = useState("");
  const { actions } = useContext(Context); // Destructure actions from Context

  if (!actions) {
    return <div>Error: Actions not available</div>;
  }

  return (
    <div className="App">
      <input type='text' value={name} onChange={(e) => setValue(e.target.value)} />
      <button onClick={() => actions.getname(name)}>Add my name here</button>
    </div>
  );
}

export default App;
