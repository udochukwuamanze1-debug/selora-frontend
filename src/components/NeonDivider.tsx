export const NeonDivider = () => {
  return (
    <div className="relative py-8">
      {/* Glass container */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative h-px">
          {/* Base line */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent blur-sm" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent blur-md opacity-50" />
          
          {/* Center glow orb */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary blur-sm" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary-foreground" />
        </div>
      </div>
    </div>
  );
};
