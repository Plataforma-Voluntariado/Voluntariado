import "./Tabs.css";

export const Tabs = ({ tabs, activeTab, onTabChange, tabAlert }) => {
  return (
    <div className="creator-events-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`
            creator-tab-btn 
            ${activeTab === tab.key ? "active" : ""} 
            ${tabAlert === tab.key ? "alert" : ""}
          `}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
