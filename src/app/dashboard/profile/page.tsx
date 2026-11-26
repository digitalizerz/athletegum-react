import { requireUser } from "@/app/actions/auth";
import { BusinessProfileForm } from "@/components/business-profile-form";
import { PasswordForm } from "@/components/password-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BusinessProfilePage() {
  const session = await requireUser("business");
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return null;

  return (
    <div>
      <p className="text-xs font-semibold tracking-[0.18em] text-black/40">SETTINGS</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Company profile</h1>
      <p className="mt-2 text-black/60">Manage the company name, contact, logo, and social handles athletes see.</p>
      <div className="mt-6">
        <BusinessProfileForm
          user={{
            name: user.name,
            businessName: user.businessName,
            email: user.email,
            phone: user.phone,
            city: user.city,
            bio: user.bio,
            profilePhoto: user.profilePhoto,
            instagramHandle: user.instagramHandle,
            tiktokHandle: user.tiktokHandle,
            twitterHandle: user.twitterHandle,
            youtubeHandle: user.youtubeHandle,
          }}
        />
        <PasswordForm />
      </div>
    </div>
  );
}
