import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Heart, Share2 } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function DailyVerse({ verse, reference, onRefresh, isLoading }) {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-emerald-50 border-amber-100">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-200/20 rounded-full blur-2xl" />
      
      <div className="relative p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-medium text-amber-700 uppercase tracking-wider">Daily Reflection Verse

          </span>
        </div>
        
        <blockquote className="text-xl md:text-2xl lg:text-3xl font-serif text-stone-700 leading-relaxed mb-4 italic">
          "{verse}"
        </blockquote>
        
        <p className="text-amber-700 font-medium">— {reference}</p>
        
        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-amber-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="text-stone-500 hover:text-amber-700 hover:bg-amber-50 rounded-full">

            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            New Verse
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-full">

            <Heart className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full">

            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </Card>);

}