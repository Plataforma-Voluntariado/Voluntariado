import "./Tabs.css";

export const Tabs = ({
  tabs,
  activeTab,
  onTabChange,
  tabAlert,
  tabAlerts,
}) => {
  const alertKeys = new Set(
    [
      ...(Array.isArray(tabAlerts) ? tabAlerts : []),
      ...(tabAlert ? [tabAlert] : []),
    ].filter(Boolean)
  );

  return (
    <div className="creator-events-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          data-key={tab.key}
          className={`
            creator-tab-btn 
            ${activeTab === tab.key ? "active" : ""} 
            ${alertKeys.has(tab.key) ? "alert" : ""}
          `}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
