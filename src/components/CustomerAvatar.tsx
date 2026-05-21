type CustomerAvatarProps = {
  profilePicture?: string | null;
  initials: string;
  avatarColor?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
};

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
} as const;

export default function CustomerAvatar({
  profilePicture,
  initials,
  avatarColor,
  size = "md",
}: CustomerAvatarProps) {
  const classes = `inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${sizeClasses[size]}`;

  if (profilePicture) {
    return <img src={profilePicture} alt={initials} className={`${classes} object-cover`} />;
  }

  return (
    <div className={classes} style={{ backgroundColor: avatarColor || "#f97316" }}>
      {initials}
    </div>
  );
}
