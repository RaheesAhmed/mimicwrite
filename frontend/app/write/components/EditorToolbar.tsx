"use client";

import { Editor } from '@tiptap/react';
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface EditorToolbarProps {
  editor: Editor | null;
  toggleHeading: (level: 1 | 2) => void;
  toggleList: (type: 'bulletList' | 'orderedList') => void;
}

export default function EditorToolbar({ 
  editor, 
  toggleHeading, 
  toggleList 
}: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  // Check if inline heading is active
  const isHeadingActive = (level: 1 | 2) => {
    return editor.isActive('textStyle', { heading: level.toString() });
  };

  return (
    <div className="border-b px-3 py-2 flex flex-wrap gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-muted' : ''}
            aria-label="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Bold</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-muted' : ''}
            aria-label="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Italic</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleHeading(1)}
            className={isHeadingActive(1) ? 'bg-muted' : ''}
            aria-label="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Heading 1 (Inline)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleHeading(2)}
            className={isHeadingActive(2) ? 'bg-muted' : ''}
            aria-label="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Heading 2 (Inline)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleList('bulletList')}
            className={editor.isActive('bulletList') ? 'bg-muted' : ''}
            aria-label="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Bullet List</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleList('orderedList')}
            className={editor.isActive('orderedList') ? 'bg-muted' : ''}
            aria-label="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Ordered List</TooltipContent>
      </Tooltip>
    </div>
  );
} 