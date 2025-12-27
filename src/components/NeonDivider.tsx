export const NeonDivider = () => {
  return (
    <div className="relative py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative h-px">
          {/* Subtle gradient line */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
      </div>
    </div>
  );
};
