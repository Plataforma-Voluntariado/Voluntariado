export const customSelectStylesVoluntariado = {
    container: (provided) => ({
        ...provided,
        width: "100%",
    }),
    control: (provided, state) => ({
        ...provided,
        width: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(10px)",
        borderRadius: "var(--radius-medium)",
        border: state.isFocused ? "1px solid var(--color-primary)" : "1px solid rgba(0, 0, 0, 0.1)",
        boxShadow: state.isFocused ? "0 0 0 4px rgba(0, 122, 255, 0.1)" : "none",
        padding: "0.45rem 0.2rem",
        minHeight: "auto",
        fontSize: "0.95rem",
        color: "#1a1a1a",

        cursor: "pointer",
        transition: "all var(--transition)",
        marginTop: 4,
        "&:hover": {
            borderColor: state.isFocused ? "var(--color-primary)" : "rgba(0, 0, 0, 0.2)",
        },
    }),

    valueContainer: (provided) => ({
        ...provided,
        padding: "0 8px",
    }),
    input: (provided) => ({
        ...provided,
        margin: 0,
        padding: 0,
        color: "#1a1a1a",
    }),
    placeholder: (provided) => ({
        ...provided,
        color: "#6b6b6b",
        fontSize: "0.95rem",
        margin: 0,
    }),
    singleValue: (provided) => ({
        ...provided,
        color: "#1a1a1a",
        fontSize: "0.95rem",
        margin: 0,
    }),
    dropdownIndicator: (provided) => ({
        ...provided,
        padding: "4px 8px",
        color: "rgba(0, 0, 0, 0.4)",
        "&:hover": { color: "var(--color-primary)" },
    }),
    clearIndicator: (provided) => ({
        ...provided,
        padding: "4px 8px",
        color: "rgba(0, 0, 0, 0.4)",
        "&:hover": { color: "var(--color-primary)" },
    }),
    indicatorSeparator: (provided) => ({
        ...provided,
        backgroundColor: "rgba(0, 0, 0, 0.1)",
    }),
    menu: (provided) => ({
        ...provided,
        borderRadius: "var(--radius-medium)",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        zIndex: 9999,
        overflow: "hidden",
    }),
    menuList: (provided) => ({
        ...provided,
        padding: 0,
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? "var(--color-primary)" : state.isFocused ? "rgba(0, 122, 255, 0.1)" : "#fff",
        color: state.isSelected ? "#fff" : "#1a1a1a",
        padding: "0.75rem 1rem",
        fontSize: "0.95rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:active": {
            backgroundColor: "var(--color-primary)",
            color: "#fff",
        },
    }),
};

