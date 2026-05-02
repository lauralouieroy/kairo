import { useState } from "react";
import Timer from "./components/Timer";
import Preloader from "./components/Preloader";

function App() {
  const [loading, setLoading] = useState(true);
  const [showApp, setShowApp] = useState(false);

  const handleFinish = () => {
    setLoading(false);

    // delay for smooth entry
    setTimeout(() => {
      setShowApp(true);
    }, 50);
  };

  return (
    <>
      {loading && <Preloader onFinish={handleFinish} />}

      <div
        className={`transition-all duration-700 ${
          showApp ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {!loading && <Timer />}
      </div>
    </>
  );
}

export default App;