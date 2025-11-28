import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Heart, BookmarkPlus, Share2, MessageSquare, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function VerseCard({ 
  verse, 
  reference, 
  version,
  onFavorite, 
  onAnnotate,
  isFavorited,
  annotation,
  academicNotes 
}) {
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [showAcademic, setShowAcademic] = useState(false);

  return (
    <div className="group relative">
      <div className={cn(
        "bg-gradient-to-br from-white to-amber-50/30 rounded-2xl p-6 border border-amber-100/50",
        "hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-300"
      )}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-lg md:text-xl leading-relaxed text-stone-700 font-serif italic">
              "{verse}"
            </p>
            <p className="mt-4 text-sm font-medium text-amber-700">
              — {reference} ({version})
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onFavorite}
              className={cn(
                "rounded-full h-9 w-9",
                isFavorited ? "text-rose-500 bg-rose-50" : "text-stone-400 hover:text-rose-500 hover:bg-rose-50"
              )}
            >
              <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onAnnotate}
              className="rounded-full h-9 w-9 text-stone-400 hover:text-amber-600 hover:bg-amber-50"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {annotation && (
          <div className="mt-4 pt-4 border-t border-amber-100">
            <p className="text-sm text-stone-600 italic">
              <span className="font-medium text-amber-700">Your note: </span>
              {annotation}
            </p>
          </div>
        )}

        {academicNotes && (
          <div className="mt-4">
            <button
              onClick={() => setShowAcademic(!showAcademic)}
              className="flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              <Sparkles className="h-4 w-4" />
              Academic Insights
              {showAcademic ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showAcademic && (
              <div className="mt-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <p className="text-sm text-stone-600 leading-relaxed">
                  {academicNotes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}