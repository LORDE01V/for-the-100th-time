import React, { useState, useEffect } from "react";
import "./AISuggestions.css"; // Add styles for the page

const AISuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Mock data for suggestions
  useEffect(() => {
    const mockSuggestions = [
      { id: 1, title: "Save Energy", description: "Turn off unused appliances.", category: "Energy Saving", votes: 10 },
      { id: 2, title: "Maintenance Alert", description: "Check your solar panels.", category: "Maintenance", votes: 5 },
      { id: 3, title: "Upgrade Recommendation", description: "Consider upgrading to a 5kW inverter.", category: "Upgrades", votes: 8 },
    ];
    setSuggestions(mockSuggestions);
    setFilteredSuggestions(mockSuggestions);
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    const filtered = suggestions.filter((s) =>
      s.title.toLowerCase().includes(term.toLowerCase()) || s.description.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredSuggestions(filtered);
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    if (category === "All") {
      setFilteredSuggestions(suggestions);
    } else {
      const filtered = suggestions.filter((s) => s.category === category);
      setFilteredSuggestions(filtered);
    }
  };

  // Handle voting
  const handleVote = (id, type) => {
    const updatedSuggestions = suggestions.map((s) => {
      if (s.id === id) {
        return { ...s, votes: type === "upvote" ? s.votes + 1 : s.votes - 1 };
      }
      return s;
    });
    setSuggestions(updatedSuggestions);
    setFilteredSuggestions(updatedSuggestions);
  };

  return (
    <div className="ai-suggestions">
      <h1>AI Suggestions</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search suggestions..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <div className="categories">
        {["All", "Energy Saving", "Maintenance", "Upgrades"].map((category) => (
          <button
            key={category}
            className={activeCategory === category ? "active" : ""}
            onClick={() => handleCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="suggestions-list">
        {filteredSuggestions.map((suggestion) => (
          <div key={suggestion.id} className="suggestion-card">
            <h3>{suggestion.title}</h3>
            <p>{suggestion.description}</p>
            <div className="votes">
              <button onClick={() => handleVote(suggestion.id, "upvote")}>👍</button>
              <span>{suggestion.votes}</span>
              <button onClick={() => handleVote(suggestion.id, "downvote")}>👎</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AISuggestions;