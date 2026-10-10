import React, { useState, useEffect } from 'react';

interface TypewriterProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
  cursorClassName?: string;
  textClassName?: string;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  words,
  typingSpeed = 50,
  deletingSpeed = 25,
  pauseDuration = 2200,
  className = '',
  cursorClassName = '',
  textClassName = '',
}) => {
  const [wordIndex, setWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState(words && words.length > 0 ? words[0] : '');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;

    const targetWord = words[wordIndex % words.length];

    if (!isDeleting && currentText === targetWord) {
      // Finished typing full word, pause before deleting
      const timeout = setTimeout(() => {
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && currentText === '') {
      // Finished deleting word, move to next
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const speed = isDeleting ? deletingSpeed : typingSpeed;
    const timeout = setTimeout(() => {
      if (isDeleting) {
        setCurrentText(targetWord.substring(0, currentText.length - 1));
      } else {
        setCurrentText(targetWord.substring(0, currentText.length + 1));
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      <span className={textClassName}>{currentText}</span>
      <span
        aria-hidden="true"
        className={`inline-block w-[3px] sm:w-[4px] h-[0.82em] ml-2 align-middle bg-gradient-to-b from-[#FFF3B0] via-[#F5D77F] to-[#D4AF37] rounded-full animate-pulse shadow-[0_0_12px_#D4AF37] ${cursorClassName}`}
      />
    </span>
  );
};

export default Typewriter;
