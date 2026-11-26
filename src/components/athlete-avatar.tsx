export function AthleteAvatar({ name, photo, size = 64 }: { name: string; photo: string | null; size?: number }) {
  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  const initial = name.trim().charAt(0).toUpperCase() || "A";
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-zinc-200 font-semibold text-black"
      style={{ width: size, height: size, fontSize: Math.max(14, Math.round(size * 0.38)) }}
    >
      {initial}
    </span>
  );
}
