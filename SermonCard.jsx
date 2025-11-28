import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, MapPin, Calendar, Clock, BookOpen, Heart, ExternalLink } from 'lucide-react';
import { cn } from "@/lib/utils";
import { format } from 'date-fns';

export default function SermonCard({ 
  sermon, 
  onSave, 
  isSaved,
  variant = 'default' 
}) {
  const isLive = sermon.isLive;
  const isLocal = sermon.isLocal;

  return (
    <Card className={cn(
      "overflow-hidden hover:shadow-lg transition-all duration-300",
      isLive && "ring-2 ring-rose-400 ring-offset-2"
    )}>
      <div className="relative">
        {sermon.thumbnail ? (
          <img 
            src={sermon.thumbnail} 
            alt={sermon.title}
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="w-full h-40 bg-gradient-to-br from-amber-100 to-emerald-100 flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-amber-600/50" />
          </div>
        )}
        
        {isLive && (
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge className="bg-rose-500 text-white animate-pulse">
              <span className="inline-block w-2 h-2 bg-white rounded-full mr-2" />
              LIVE NOW
            </Badge>
          </div>
        )}
        
        {isLocal && (
          <Badge className="absolute top-3 right-3 bg-emerald-500 text-white">
            <MapPin className="h-3 w-3 mr-1" />
            Local
          </Badge>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-stone-800 line-clamp-2 mb-2">
          {sermon.title}
        </h3>
        
        <p className="text-sm text-stone-500 mb-3">{sermon.preacher}</p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {sermon.verseReference && (
            <Badge variant="outline" className="text-xs border-amber-200 text-amber-700">
              <BookOpen className="h-3 w-3 mr-1" />
              {sermon.verseReference}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-stone-500 mb-4">
          {sermon.church && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {sermon.church}
            </span>
          )}
          {sermon.date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(sermon.date), 'MMM d')}
            </span>
          )}
          {sermon.duration && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {sermon.duration}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            className={cn(
              "flex-1 rounded-xl",
              isLive 
                ? "bg-rose-500 hover:bg-rose-600" 
                : "bg-amber-600 hover:bg-amber-700"
            )}
            onClick={() => window.open(sermon.url, '_blank')}
          >
            {isLive ? (
              <>
                <Play className="h-4 w-4 mr-2" />
                Watch Live
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                View
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onSave}
            className={cn(
              "rounded-xl border-amber-200",
              isSaved && "bg-rose-50 border-rose-200 text-rose-500"
            )}
          >
            <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
          </Button>
        </div>
      </div>
    </Card>
  );
}