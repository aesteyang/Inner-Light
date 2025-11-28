import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

const BIBLE_BOOKS = {
  oldTestament: [
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
    "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
    "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
    "Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
    "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
    "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
    "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
    "Zephaniah", "Haggai", "Zechariah", "Malachi"
  ],
  newTestament: [
    "Matthew", "Mark", "Luke", "John", "Acts",
    "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
    "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy",
    "2 Timothy", "Titus", "Philemon", "Hebrews", "James",
    "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
    "Jude", "Revelation"
  ]
};

export default function BibleBookSelector({ selectedBook, onSelectBook }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('all');

  const filterBooks = (books) => {
    if (!searchQuery) return books;
    return books.filter(book => 
      book.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const oldTestamentFiltered = filterBooks(BIBLE_BOOKS.oldTestament);
  const newTestamentFiltered = filterBooks(BIBLE_BOOKS.newTestament);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
      <div className="p-4 border-b border-amber-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
          <Input
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-amber-200 focus:ring-amber-500 focus:border-amber-500 rounded-xl"
          />
        </div>
        <div className="flex gap-2 mt-3">
          {['all', 'old', 'new'].map((section) => (
            <Button
              key={section}
              variant="ghost"
              size="sm"
              onClick={() => setActiveSection(section)}
              className={cn(
                "rounded-full text-xs capitalize",
                activeSection === section 
                  ? "bg-amber-100 text-amber-800 hover:bg-amber-200" 
                  : "text-stone-500 hover:bg-amber-50"
              )}
            >
              {section === 'all' ? 'All Books' : section === 'old' ? 'Old Testament' : 'New Testament'}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="p-4">
          {(activeSection === 'all' || activeSection === 'old') && oldTestamentFiltered.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs uppercase tracking-wider text-amber-600 font-semibold mb-3 px-2">
                Old Testament
              </h3>
              <div className="grid grid-cols-2 gap-1">
                {oldTestamentFiltered.map((book) => (
                  <button
                    key={book}
                    onClick={() => onSelectBook(book)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all",
                      selectedBook === book
                        ? "bg-amber-100 text-amber-900 font-medium"
                        : "hover:bg-amber-50 text-stone-600"
                    )}
                  >
                    <BookOpen className="h-3.5 w-3.5 text-amber-500" />
                    <span className="truncate">{book}</span>
                    {selectedBook === book && (
                      <ChevronRight className="h-3.5 w-3.5 ml-auto text-amber-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(activeSection === 'all' || activeSection === 'new') && newTestamentFiltered.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wider text-emerald-600 font-semibold mb-3 px-2">
                New Testament
              </h3>
              <div className="grid grid-cols-2 gap-1">
                {newTestamentFiltered.map((book) => (
                  <button
                    key={book}
                    onClick={() => onSelectBook(book)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all",
                      selectedBook === book
                        ? "bg-emerald-100 text-emerald-900 font-medium"
                        : "hover:bg-emerald-50 text-stone-600"
                    )}
                  >
                    <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="truncate">{book}</span>
                    {selectedBook === book && (
                      <ChevronRight className="h-3.5 w-3.5 ml-auto text-emerald-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}