import { Link } from "react-router-dom";

export const PortalFooter = () => {
  return (
    <div className="mt-12 pt-6 border-t border-border/50 text-center text-xs text-muted-foreground">
      <p>© 2025, Selora. <Link to="/privacy" className="hover:text-primary">Privacy Policy</Link> • <Link to="/terms" className="hover:text-primary">Terms of Use</Link></p>
    </div>
  );
};
