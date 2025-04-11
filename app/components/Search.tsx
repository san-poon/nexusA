'use client';
import { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { SearchIcon } from "lucide-react";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CourseWithTags } from '@/lib/courses-server';

interface SearchProps {
  className?: string;
  coursesData: CourseWithTags[];
}

export default function Search({ className, coursesData }: SearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CourseWithTags[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }

    const filteredCourses = coursesData
      .filter(course =>
        course.title.toLowerCase().includes(query.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(0, 7);

    setSearchResults(filteredCourses);
    setIsDropdownOpen(filteredCourses.length > 0);
  };

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-blue-500';
      case 'advanced': return 'bg-purple-500';
      case 'expert': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={cn('relative w-full md:w-96', className)}>
      <div className='flex items-center h-9 w-full border rounded-full border-neutral-300 dark:border-neutral-700 ps-2 md:ps-4'>
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          className='border-none focus-visible:outline-0 dark:focus-visible:outline-0'
          placeholder={'What do you want to learn?'}
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
          {searchResults.map((course) => (
            <Link
              href={`/contribute/${course.id}`}
              key={course.id}
              onClick={() => setIsDropdownOpen(false)}
            >
              <div className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">
                <div className="font-medium">{course.title}</div>
                {course.description && (
                  <div className="text-sm text-muted-foreground truncate">{course.description}</div>
                )}
                <div className="flex flex-wrap mt-1 gap-1">
                  <span className={`px-1.5 py-0.5 text-white text-xs rounded ${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty}
                  </span>
                  {course.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                {course.estimatedHours && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Estimated: {course.estimatedHours} hours
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