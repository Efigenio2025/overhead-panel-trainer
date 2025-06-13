
import { useEffect, useState } from "react";

const checklistSteps = [
  { label: "Landing Gear – Chocked", manual: true },
  { label: "Panels – Closed/Secured", manual: true },
  { label: "Pitot Tubes, Vents – Clear", manual: true },
  { label: "Emergency Parking Brake – Set", manual: true },
  { label: "GPU AVAIL LIGHT – Select 'IN USE'", panel: true },
  { label: "Fire Test Button – Press 2-10 sec.", panel: true },
  { label: "APU Control Master – On", panel: true },
  { label: "Monitor APU RPM – 100%", manual: true },
];

const panelMapAreas = [
  { top: 18, left: 62, label: "GPU AVAIL LIGHT", stepIndex: 4 },
  { top: 28, left: 58, label: "Fire Test", stepIndex: 5 },
  { top: 35, left: 55, label: "APU Master", stepIndex: 6 },
];

export default function OverheadPanelTrainer() {
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState("awaiting");
  const [verifiedSteps, setVerifiedSteps] = useState([]);

  useEffect(() => {
    if (currentStep < checklistSteps.length) {
      const utterance = new SpeechSynthesisUtterance(checklistSteps[currentStep].label);
      speechSynthesis.speak(utterance);
      setStatus("listening");

      const timer = setTimeout(() => {
        setStatus("failed");
        speechSynthesis.cancel();
        const failMsg = new SpeechSynthesisUtterance("Failed. Restarting checklist.");
        speechSynthesis.speak(failMsg);
        setCurrentStep(0);
        setVerifiedSteps([]);
      }, 15000);

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const markVerified = (index) => {
    if (index === currentStep && status === "listening") {
      setVerifiedSteps([...verifiedSteps, index]);
      setStatus("correct");
      setCurrentStep(currentStep + 1);
    } else {
      setStatus("failed");
      speechSynthesis.cancel();
      const failMsg = new SpeechSynthesisUtterance("Incorrect step. Restarting checklist.");
      speechSynthesis.speak(failMsg);
      setCurrentStep(0);
      setVerifiedSteps([]);
    }
  };

  const handlePanelClick = (stepIndex) => {
    markVerified(stepIndex);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Overhead Panel Checklist Trainer</h1>

      <div className="relative border w-full max-w-4xl h-[500px] mx-auto mb-6">
        <img
          src="/erj_overhead_panel.jpg"
          alt="ERJ 170/175 Overhead Panel"
          className="w-full h-full object-cover"
        />
        {panelMapAreas.map((area, i) => (
          <button
            key={i}
            onClick={() => handlePanelClick(area.stepIndex)}
            className="absolute bg-blue-500/70 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
            style={{ top: `${area.top}%`, left: `${area.left}%`, position: 'absolute' }}
          >
            {area.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {checklistSteps.map((step, index) => (
          <div key={index} className="flex items-center justify-between border p-3 rounded-xl">
            <span className={
              index === currentStep ? "font-semibold text-blue-700" : "text-gray-700"
            }>
              {step.label}
            </span>
            {step.manual && (
              <button
                onClick={() => markVerified(index)}
                disabled={verifiedSteps.includes(index)}
                className={`text-sm px-3 py-1 rounded ${
                  verifiedSteps.includes(index)
                    ? "bg-green-400 text-white cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {verifiedSteps.includes(index) ? "Verified" : "Click to Verify"}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 text-lg">
        {status === "correct" && <p className="text-green-600">Correct, proceed...</p>}
        {status === "failed" && <p className="text-red-600">Checklist failed. Restarting...</p>}
        {status === "listening" && <p className="text-yellow-600">Waiting for input...</p>}
      </div>
    </div>
  );
}
