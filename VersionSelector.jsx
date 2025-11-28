import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookMarked } from 'lucide-react';

const BIBLE_VERSIONS = [
  { id: 'KJV', name: 'King James Version', description: 'Traditional, formal translation (1611)' },
  { id: 'NIV', name: 'New International Version', description: 'Balance of accuracy and readability' },
  { id: 'ESV', name: 'English Standard Version', description: 'Essentially literal translation' },
  { id: 'NASB', name: 'New American Standard', description: 'Most literal word-for-word' },
  { id: 'NLT', name: 'New Living Translation', description: 'Thought-for-thought, easy to read' },
];

export default function VersionSelector({ selectedVersion, onVersionChange }) {
  return (
    <div className="flex items-center gap-3">
      <BookMarked className="h-5 w-5 text-amber-600" />
      <Select value={selectedVersion} onValueChange={onVersionChange}>
        <SelectTrigger className="w-[200px] border-amber-200 rounded-xl bg-white">
          <SelectValue placeholder="Select version" />
        </SelectTrigger>
        <SelectContent>
          {BIBLE_VERSIONS.map((version) => (
            <SelectItem key={version.id} value={version.id}>
              <div className="flex flex-col">
                <span className="font-medium">{version.id}</span>
                <span className="text-xs text-stone-500">{version.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}