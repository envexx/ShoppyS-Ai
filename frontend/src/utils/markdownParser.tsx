import React from 'react';

interface MarkdownParserProps {
  content: string;
  className?: string;
}

export const parseMarkdown = (text: string): (string | JSX.Element)[] => {
  // Handle undefined, null, or empty text
  if (!text || typeof text !== 'string') {
    return [text || ''];
  }

  // Pre-process text to clean up formatting issues
  let processedText = text;
  
  // Remove URLs and links (keep only text)
  processedText = processedText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  processedText = processedText.replace(/https?:\/\/[^\s\)]+/g, '');
  processedText = processedText.replace(/\(\s*\)/g, '');
  processedText = processedText.replace(/\[\s*\]/g, '');
  
  // Fix broken bold formatting
  const boldMatches: string[] = [];
  processedText = processedText.replace(/\*\*([^*]+?)\*\*/g, (match) => {
    boldMatches.push(match);
    return `__BOLD_${boldMatches.length - 1}__`;
  });
  
  // Handle broken bold formatting patterns
  processedText = processedText.replace(/\*\*([^*]+?)(\s+-\s+[^*]+?)(\d+\.\s)/g, '**$1**$2\n\n$3');
  processedText = processedText.replace(/\*\*([^*]+?)(\s+-\s+[^*]+?)(\.\s+[A-Z])/g, '**$1**$2$3');
  
  // Restore protected bold text
  boldMatches.forEach((match, index) => {
    processedText = processedText.replace(`__BOLD_${index}__`, match);
  });
  
  // Add line breaks for better readability
  processedText = processedText.replace(/([^0-9])\s*(\d+\.\s)/g, '$1\n\n$2');
  processedText = processedText.replace(/^(\d+\.\s)/gm, '\n\n$1');
  processedText = processedText.replace(/(\d+\.\s+[^0-9]+?)(\d+\.\s+)/g, '$1\n\n$2');
  
  // Clean up whitespace
  processedText = processedText.replace(/[ \t]+/g, ' ');
  processedText = processedText.replace(/\n{3,}/g, '\n\n');
  processedText = processedText.trim();

  const result: (string | JSX.Element)[] = [];
  let keyCounter = 0;

  // Simple approach: process text character by character
  let i = 0;
  let currentText = '';

  while (i < processedText.length) {
    // Check for [Product Name](URL) links
    if (processedText[i] === '[') {
      // Add any accumulated text
      if (currentText) {
        result.push(currentText);
        currentText = '';
      }
      
      // Find the closing ] and opening (
      const endBracket = processedText.indexOf(']', i + 1);
      const startParen = processedText.indexOf('(', endBracket);
      const endParen = processedText.indexOf(')', startParen);
      
      if (endBracket !== -1 && startParen !== -1 && endParen !== -1) {
        const linkText = processedText.substring(i + 1, endBracket);
        const linkUrl = processedText.substring(startParen + 1, endParen);
        
        // Fix broken product links (remove double links)
        const cleanLinkText = linkText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        const cleanLinkUrl = linkUrl.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        
        // Check if this is a product link
        if (cleanLinkUrl.includes('shoppysensay.myshopify.com/products/')) {
          result.push(
            <a
              key={`product-link-${keyCounter++}`}
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#71B836] hover:text-[#5A9A2E] font-medium underline decoration-[#71B836]/30 hover:decoration-[#71B836] transition-all duration-200"
            >
              {cleanLinkText}
            </a>
          );
        } else {
          // Regular link
          result.push(
            <a
              key={`link-${keyCounter++}`}
              href={cleanLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              {cleanLinkText}
            </a>
          );
        }
        
        i = endParen + 1;
        continue;
      }
    }
    
    // Check for **bold** text
    if (processedText.substr(i, 2) === '**') {
      // Add any accumulated text
      if (currentText) {
        result.push(currentText);
        currentText = '';
      }
      
      // Find the closing **
      const endIndex = processedText.indexOf('**', i + 2);
      if (endIndex !== -1) {
        const content = processedText.substring(i + 2, endIndex);
        result.push(
          <strong key={`bold-${keyCounter++}`} className="font-bold text-gray-900 dark:text-white">
            {content}
          </strong>
        );
        i = endIndex + 2;
        continue;
      }
    }
    
    // Check for __bold__ text
    if (processedText.substr(i, 2) === '__') {
      // Add any accumulated text
      if (currentText) {
        result.push(currentText);
        currentText = '';
      }
      
      // Find the closing __
      const endIndex = processedText.indexOf('__', i + 2);
      if (endIndex !== -1) {
        const content = processedText.substring(i + 2, endIndex);
        result.push(
          <strong key={`bold-${keyCounter++}`} className="font-bold text-gray-900 dark:text-white">
            {content}
          </strong>
        );
        i = endIndex + 2;
        continue;
      }
    }
    
    // Check for *italic* text (but not **)
    if (processedText[i] === '*' && processedText[i + 1] !== '*') {
      // Add any accumulated text
      if (currentText) {
        result.push(currentText);
        currentText = '';
      }
      
      // Find the closing *
      const endIndex = processedText.indexOf('*', i + 1);
      if (endIndex !== -1 && processedText[endIndex + 1] !== '*') {
        const content = processedText.substring(i + 1, endIndex);
        result.push(
          <em key={`italic-${keyCounter++}`} className="italic text-gray-800 dark:text-gray-200">
            {content}
          </em>
        );
        i = endIndex + 1;
        continue;
      }
    }
    
    // Check for `code` text
    if (processedText[i] === '`') {
      // Add any accumulated text
      if (currentText) {
        result.push(currentText);
        currentText = '';
      }
      
      // Find the closing `
      const endIndex = processedText.indexOf('`', i + 1);
      if (endIndex !== -1) {
        const content = processedText.substring(i + 1, endIndex);
        result.push(
          <code key={`code-${keyCounter++}`} className="bg-gray-100 dark:bg-gray-700 text-red-600 dark:text-red-400 px-1 py-0.5 rounded text-sm font-mono">
            {content}
          </code>
        );
        i = endIndex + 1;
        continue;
      }
    }
    
    // Regular character
    currentText += processedText[i];
    i++;
  }
  
  // Add any remaining text
  if (currentText) {
    result.push(currentText);
  }

  return result.length > 0 ? result : [processedText];
};

export const MarkdownText: React.FC<MarkdownParserProps> = ({ content, className = "" }) => {
  // Handle undefined or null content
  if (!content) {
    return <span className={className}></span>;
  }
  
  const parsedContent = parseMarkdown(content);
  
  return (
    <span className={className}>
      {parsedContent}
    </span>
  );
};

export default MarkdownText;
