import React, { useState, useRef, useEffect } from 'react';
import { Command } from 'cmdk';
import { X, Search, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type TagInputProps = {
  label: string;
  placeholder?: string;
  tags: string[];
  setTags: (tags: string[]) => void;
  suggestions?: string[];
  className?: string;
};

// Default tech suggestions
const DEFAULT_SUGGESTIONS = [
  // Programming Languages
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Swift", "Kotlin", "PHP", "Ruby",
  // Frontend
  "React", "Vue.js", "Angular", "Svelte", "Next.js", "Nuxt.js", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap", "Material UI",
  // Backend
  "Node.js", "Express", "Django", "Flask", "Spring Boot", ".NET Core", "Laravel", "Ruby on Rails",
  // Database
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Oracle", "Cassandra", "DynamoDB",
  // DevOps & Cloud
  "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Jenkins", "GitHub Actions", "GitLab CI", "Terraform",
  // Tools
  "Git", "GitHub", "GitLab", "Jira", "Figma", "Adobe XD", "VS Code", "Postman"
];

const TagInput: React.FC<TagInputProps> = ({ 
  label, 
  placeholder = "Enter an item", 
  tags, 
  setTags, 
  suggestions = DEFAULT_SUGGESTIONS,
  className 
}) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions not already selected
  const filteredSuggestions = suggestions.filter(
    skill => !tags.includes(skill) && skill.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10); // Limit to top 10

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setQuery("");
    inputRef.current?.focus();
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim() !== "") {
      e.preventDefault();
      addTag(query.trim());
    } else if (e.key === "Backspace" && query === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [containerRef]);

  return (
    <div className={cn("mb-6 relative w-full", className)} ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      
      <div 
        className={cn(
          "flex flex-wrap items-center gap-2 p-3 min-h-[50px] rounded-lg border bg-white dark:bg-gray-800 transition-all",
          open ? "border-primary-500 ring-2 ring-primary-500/20" : "border-gray-300 dark:border-gray-600 focus-within:border-primary-500"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <AnimatePresence>
          {tags.map((tag) => (
            <motion.span
              key={tag}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300"
            >
              {tag}
              <button
                type="button"
                className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800/50 transition-colors focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
              >
                <X className="w-3 h-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>

        <Command className="flex-1 min-w-[120px] relative overflow-visible bg-transparent">
          <div className="flex items-center" cmdk-input-wrapper="">
            {tags.length === 0 && <Search className="w-4 h-4 mr-2 text-gray-400 absolute left-0" />}
            <Command.Input
              ref={inputRef}
              value={query}
              onValueChange={(val) => {
                setQuery(val);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              className={cn(
                "w-full bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500",
                tags.length === 0 ? "pl-6" : ""
              )}
              placeholder={tags.length > 0 ? "" : placeholder}
            />
          </div>

          {open && (query.trim().length > 0 || filteredSuggestions.length > 0) && (
            <div className="absolute top-full left-0 w-full mt-2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <Command.List className="max-h-[200px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                
                {filteredSuggestions.length === 0 && query.trim().length > 0 && (
                  <Command.Item
                    value={query}
                    onSelect={() => addTag(query)}
                    className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 aria-selected:bg-gray-100 dark:aria-selected:bg-gray-700/50"
                  >
                    <Plus className="w-4 h-4 mr-2 text-gray-400" />
                    Add "{query}"
                  </Command.Item>
                )}

                {filteredSuggestions.map((suggestion) => (
                  <Command.Item
                    key={suggestion}
                    value={suggestion}
                    onSelect={() => addTag(suggestion)}
                    className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 aria-selected:bg-gray-100 dark:aria-selected:bg-gray-700/50"
                  >
                    <div className="flex items-center justify-center w-5 h-5 mr-2 rounded bg-primary-100/50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[10px] font-bold">
                        {suggestion.substring(0, 1).toUpperCase()}
                    </div>
                    {suggestion}
                  </Command.Item>
                ))}
              </Command.List>
            </div>
          )}
        </Command>
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Press Enter to add not listed items.
      </p>
    </div>
  );
};

export default TagInput;