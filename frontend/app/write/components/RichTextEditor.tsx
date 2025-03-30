"use client";

import { useEffect } from "react";
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import { Extension } from '@tiptap/core';
import EditorToolbar from './EditorToolbar';

// Create a custom extension for inline heading styling
const InlineHeadingExtension = Extension.create({
  name: 'inlineHeading',
  
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          heading: {
            default: null,
            parseHTML: element => element.getAttribute('data-heading'),
            renderHTML: attributes => {
              if (!attributes.heading) {
                return {};
              }
              
              return {
                'data-heading': attributes.heading,
                'class': `inline-heading inline-heading-${attributes.heading}`,
                'style': `font-weight: ${attributes.heading === '1' ? '800' : '700'}; 
                         font-size: ${attributes.heading === '1' ? '1.5em' : '1.25em'};
                         display: inline-block;`,
              };
            },
          },
        },
      },
    ];
  },
});

interface RichTextEditorProps {
  content: string;
  isStreaming: boolean;
  onCopy: () => void;
}

export default function RichTextEditor({ 
  content, 
  isStreaming,
  onCopy
}: RichTextEditorProps) {
  // TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2]
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true, 
        },
        paragraph: {
          HTMLAttributes: {
            class: 'mb-4',
          },
        },
      }),
      TextStyle,
      InlineHeadingExtension,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-slate dark:prose-invert max-w-none px-4 py-2 min-h-[400px] focus:outline-none',
      },
    },
  });
  
  // Update editor content when generated content changes
  useEffect(() => {
    if (editor && content && !isStreaming) {
      // Convert plain text to HTML paragraphs if needed
      if (!content.includes('<p>')) {
        const paragraphs = content.split('\n\n');
        const htmlContent = paragraphs
          .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
          .join('');
        editor.commands.setContent(htmlContent);
        
        // Force a refresh to ensure styles are applied
        setTimeout(() => {
          editor.commands.focus('end');
        }, 50);
      } else {
        editor.commands.setContent(content);
        
        // Force a refresh to ensure styles are applied
        setTimeout(() => {
          editor.commands.focus('end');
        }, 50);
      }
    }
  }, [editor, content, isStreaming]);
  
  // Handle streaming updates to editor
  useEffect(() => {
    if (editor && isStreaming && content) {
      // For streaming, handle as plain text with proper paragraphs
      const paragraphs = content.split('\n\n');
      const htmlContent = paragraphs
        .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
        .join('');
      editor.commands.setContent(htmlContent);
    }
  }, [editor, isStreaming, content]);
  
  // Helper function for inline heading styling
  const toggleInlineHeading = (level: 1 | 2) => {
    if (!editor) return;
    
    const heading = level.toString();
    
    // Check if the current selection already has the heading attribute
    const isActive = editor.isActive('textStyle', { heading });
    
    // If active, remove the heading style
    if (isActive) {
      editor.chain().focus().unsetMark('textStyle').run();
      return;
    }
    
    // Apply the heading style to the selected text
    editor.chain()
      .focus()
      .setMark('textStyle', { heading })
      .run();
  };

  // Helper function for standard block heading
  const toggleBlockHeading = (level: 1 | 2) => {
    if (!editor) return;
    
    // If there is already a heading with the same level, remove it
    if (editor.isActive('heading', { level })) {
      editor.chain().focus().setParagraph().run();
      return;
    }
    
    // Apply heading to the block
    editor.chain().focus().toggleHeading({ level }).run();
  };
  
  const toggleList = (type: 'bulletList' | 'orderedList') => {
    if (!editor) return;
    
    // Check if we're already in a list of the same type
    const isActive = type === 'bulletList' 
      ? editor.isActive('bulletList')
      : editor.isActive('orderedList');
    
    // If active, remove the list formatting
    if (isActive) {
      editor.chain().focus().liftListItem('listItem').run();
      return;
    }
    
    // Apply the appropriate list type
    if (type === 'bulletList') {
      editor.chain().focus().toggleBulletList().run();
    } else {
      editor.chain().focus().toggleOrderedList().run();
    }
  };
  
  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      <EditorToolbar 
        editor={editor} 
        toggleHeading={toggleInlineHeading} 
        toggleList={toggleList} 
      />
      <style jsx global>{`
        .inline-heading {
          display: inline-block;
          line-height: 1.2;
        }
        .inline-heading-1 {
          font-size: 1.5em;
          font-weight: 800;
        }
        .inline-heading-2 {
          font-size: 1.25em;
          font-weight: 700;
        }
      `}</style>
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
} 