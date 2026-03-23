import { useState, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";

const SUGGESTED_SKILLS = [
  "react", "reactjs", "react-native", "node.js", "typescript",
  "javascript", "python", "java", "c++", "design", "ui/ux", "figma",
  "aws", "docker", "graphql", "sql", "mongodb", "nextjs", "vuejs"
];

interface SkillsInputProps {
  skills: string[];
  setSkills: (skills: string[]) => void;
}

const SkillsInput = ({ skills, setSkills }: SkillsInputProps) => {
  const [skillInput, setSkillInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim().toLowerCase();

    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
    }

    setSkillInput("");
    setShowSuggestions(false);
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      addSkill(skillInput);
    } else if (e.key === "Backspace" && skillInput === "" && skills.length > 0) {
      removeSkill(skills[skills.length - 1]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuggestions = SUGGESTED_SKILLS.filter(
    (skill) => skill.includes(skillInput.toLowerCase()) && !skills.includes(skill)
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex flex-wrap items-center gap-2 px-6 py-4 w-full min-h-[56px] rounded-xl border border-border/20 bg-secondary/30 focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all cursor-text"
        onClick={() => document.getElementById("skill-input")?.focus()}
      >
        {skills.map((skill) => (
          <span
            key={skill}
            className="flex items-center px-3 py-1 bg-primary/10 text-primary text-[11px] font-semibold rounded-full border border-primary/20"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="ml-2 text-primary/60 hover:text-primary font-bold"
            >
              &times;
            </button>
          </span>
        ))}

        <input
          id="skill-input"
          type="text"
          value={skillInput}
          onChange={(e) => {
            setSkillInput(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={skills.length === 0 ? "e.g., react nodejs" : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-foreground placeholder:text-muted-foreground/30 font-medium text-sm py-1"
          autoComplete="off"
        />
      </div>

      {showSuggestions && skillInput && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredSuggestions.map((suggestion) => (
            <div
              key={suggestion}
              onClick={() => addSkill(suggestion)}
              className="px-4 py-2 cursor-pointer hover:bg-primary/5 text-sm font-medium text-foreground transition-colors"
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillsInput;
