import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";

interface UserCountDisplayProps {
  count: number;
}

const formatUserCount = (count: number): string => {
  if (count >= 10000) return "10k+";
  if (count >= 5000) return "5k+";
  if (count >= 1000) return "1000+";
  if (count >= 500) return "500+";
  if (count >= 100) return `${count}+`;
  return "100+";
};

export const UserCountDisplay = ({ count }: UserCountDisplayProps) => {
  const displayText = formatUserCount(count);
  
  const avatars = [avatar1, avatar2, avatar3];

  return (
    <div className="flex items-center gap-3 mt-8">
      {/* Overlapping avatar circles */}
      <div className="flex -space-x-3">
        {avatars.map((avatar, index) => (
          <div
            key={index}
            className="w-10 h-10 rounded-full border-2 border-background overflow-hidden"
            style={{ zIndex: avatars.length - index }}
          >
            <img
              src={avatar}
              alt={`User ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        <div
          className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center"
          style={{ zIndex: 0 }}
        >
          <span className="text-xs font-medium text-muted-foreground">+</span>
        </div>
      </div>
      
      {/* User count text */}
      <p className="text-sm text-muted-foreground">
        Join <span className="font-medium text-foreground">{displayText}</span> others <br /> and enjoy a self-sovereign identity.
      </p>
    </div>
  );
};
