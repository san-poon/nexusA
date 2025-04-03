'use client';
import { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import { getAllTopics, Topic } from '@/lib/topics';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Search({ className }: { className?: string }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Topic[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Function to handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const allTopics = getAllTopics();
    const filteredTopics = allTopics
      .filter(topic =>
        topic.title.toLowerCase().includes(query.toLowerCase()) ||
        topic.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(0, 7); // Only take the top 7 results

    setSearchResults(filteredTopics);
    setIsDropdownOpen(filteredTopics.length > 0);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={cn('relative w-full md:w-96', className)}>
      <div className='flex items-center h-9 w-full border rounded-full border-neutral-300 dark:border-neutral-700 ps-2 md:ps-4'>
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          className='border-none focus-visible:outline-0 dark:focus-visible:outline-0'
          placeholder='What do you want to learn?'
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchResults.length > 0 && setIsDropdownOpen(true)}
        />
      </div>

      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-1 w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md shadow-lg z-10 max-h-[300px] overflow-y-auto"
        >
          {searchResults.map((topic) => (
            <Link
              href={`/learn/${topic.id}`}
              key={topic.id}
              onClick={() => setIsDropdownOpen(false)}
            >
              <div className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">
                <div className="font-medium">{topic.title}</div>
                {topic.description && (
                  <div className="text-sm text-muted-foreground truncate">{topic.description}</div>
                )}
                <div className="flex mt-1 space-x-1">
                  {topic.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                {topic.completePercentage < 100 && (
                  <div className="w-full h-1 bg-neutral-200 dark:bg-neutral-700 mt-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${topic.completePercentage}%` }}
                    />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}