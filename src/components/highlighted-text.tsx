import React from 'react';

interface HighlightedTextProps {
  text: string;
  highlight: string;
  className?: string;
  maxLength?: number;
}

/**
 * Composant qui met en surbrillance les parties d'un texte qui correspondent à une recherche
 */
export const HighlightedText: React.FC<HighlightedTextProps> = ({ 
  text, 
  highlight, 
  className = '',
  maxLength
}) => {
  if (!text) return null;
  if (!highlight.trim()) {
    const displayText = maxLength && text.length > maxLength 
      ? `${text.substring(0, maxLength)}...` 
      : text;
    return <span className={className}>{displayText}</span>;
  }
  
  // Pour la recherche insensible à la casse
  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  // Si le texte est trop long et qu'on a spécifié une longueur maximum
  if (maxLength && text.length > maxLength) {
    // Trouve l'indice de la première occurrence de la recherche
    const lowerText = text.toLowerCase();
    const lowerHighlight = highlight.toLowerCase();
    const firstMatchIndex = lowerText.indexOf(lowerHighlight);
    
    if (firstMatchIndex > maxLength / 2) {
      // Si la correspondance est loin dans le texte, on affiche autour de la première occurrence
      const start = Math.max(0, firstMatchIndex - Math.floor(maxLength / 3));
      const end = Math.min(text.length, start + maxLength);
      const truncatedText = (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');
      
      // Divise le texte tronqué avec la regex pour la mise en surbrillance
      const truncatedParts = truncatedText.split(regex);
      
      return (
        <span className={className}>
          {truncatedParts.map((part, i) => 
            regex.test(part) ? (
              <span key={i} className="bg-primary/20 text-primary font-medium">{part}</span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </span>
      );
    }
  }

  // Affichage standard avec mise en surbrillance
  return (
    <span className={className}>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <span key={i} className="bg-primary/20 text-primary font-medium">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};
