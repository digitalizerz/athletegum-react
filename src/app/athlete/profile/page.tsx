import { requireUser } from "@/app/actions/auth";
import { AthleteProfileForm } from "@/components/athlete-profile-form";
import { PasswordForm } from "@/components/password-form";
import { appOrigin } from "@/lib/app-origin";
import { prisma } from "@/lib/prisma";
import { profileSlug } from "@/lib/profile";
import { ensureProfileToken } from "@/lib/profile-media";

export const dynamic = "force-dynamic";

export default async function AthleteProfilePage() {
  const session = await requireUser("athlete");
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return null;
  const token = await ensureProfileToken(user.id, user.profileToken);
  const slug = profileSlug({ username: user.username, profileToken: token });
  const profileUrl = `${await appOrigin()}/a/${slug}`;

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.18em] text-black/40">SETTINGS</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Athlete profile</h1>
      <p className="mt-2 max-w-2xl text-black/60">
        Manage the name, school, photo, and social handles businesses see. Payout setup is added when Stripe Connect is connected.
      </p>
      <div className="mt-6">
        <AthleteProfileForm
          user={{
            name: user.name,
            email: user.email,
            athleteLevel: user.athleteLevel,
            sport: user.sport,
            school: user.school,
            city: user.city,
            bio: user.bio,
            username: user.username,
            profilePhoto: user.profilePhoto,
            instagramHandle: user.instagramHandle,
            tiktokHandle: user.tiktokHandle,
            twitterHandle: user.twitterHandle,
            youtubeHandle: user.youtubeHandle,
            profileUrl,
          }}
        />
        <PasswordForm />
      </div>
    </div>
  );
}
