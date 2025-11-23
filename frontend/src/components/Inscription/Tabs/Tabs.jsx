import "./Tabs.css";
let areSubtabsActive;
export const Tabs = ({
  tabs,
  activeTab,
  activePrincipalTab,
  onTabChange,
  tabAlert,
  tabAlerts,
  tourSteps,
}) => {
  const alertKeys = new Set(
    [
      ...(Array.isArray(tabAlerts) ? tabAlerts : []),
      ...(tabAlert ? [tabAlert] : []),
    ].filter(Boolean)
  );
  if(activePrincipalTab){
    areSubtabsActive = activePrincipalTab.activePrincipalTab === "terminadas";
  }else{
    areSubtabsActive = false;
  }
  return (
    <div className="creator-events-tabs">
      {tabs.map((tab) => {
        const tourStep = tourSteps?.[tab.key];
        return (
          <button
            key={tab.key}
            data-key={tab.key}
            className={`
              creator-tab-btn 
              ${areSubtabsActive ? "creator-tab-btn-subtab-active" : ""}
              ${activeTab === tab.key ? "active" : ""} 
              ${alertKeys.has(tab.key) ? "alert" : ""}
            `}
            onClick={() => onTabChange(tab.key)}
            {...(tourStep && {
              'data-intro': tourStep.intro,
              'data-step': tourStep.step
            })}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
