// Type declarations
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.svg' {
  const content: React.FC<React.SVGProps<SVGSVGElement>>;
  export default content;
}

// Extend window interface if needed
declare global {
  interface Window {
    // Add custom window properties here
  }
}

export {};
