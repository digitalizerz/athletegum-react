"use client";

import { useState } from "react";

const athleteSteps = [
  ["01", "Build your profile", "Introduce yourself beyond the game. Add your sport, school, location, and social profiles so businesses can learn more about you."],
  ["02", "Receive opportunities", "Get partnership invitations directly from businesses. Review the deliverables, deadlines, and what you'll earn before deciding to accept."],
  ["03", "Make it happen", "Accept the offer, complete the agreed work, and submit your deliverables. Keep conversations and feedback organized in one place."],
  ["04", "Get paid for your work", "Once your work is approved, your payout is initiated through your connected Stripe account. Track your earnings and payment status from your dashboard."],
];

const businessSteps = [
  ["01", "Find your athlete", "Explore athletes by sport, school, and location, or invite an athlete you already know. Express interest in listed athletes who haven't joined yet."],
  ["02", "Create your offer", "Choose the partnership type, define the work, set the compensation and deadlines, and fund the deal securely by card."],
  ["03", "Manage the partnership", "Once the invited athlete accepts, communicate directly, track submissions, and request revisions when needed."],
  ["04", "Approve and complete", "Review the completed work and approve it to initiate the athlete's payout. Keep the deal details and payment status in one place."],
];

export function PartnershipSteps() {
  const [side, setSide] = useState<"athlete" | "business">("athlete");
  const steps = side === "athlete" ? athleteSteps : businessSteps;

  return (
    <div>
      <div className="flex flex-wrap gap-3" role="tablist" aria-label="How it works">
        <TabButton active={side === "athlete"} onClick={() => setSide("athlete")}>For Athletes</TabButton>
        <TabButton active={side === "business"} onClick={() => setSide("business")}>For Businesses</TabButton>
      </div>
      <div className="mt-12 grid gap-10 md:grid-cols-2 xl:grid-cols-4" role="tabpanel">
        {steps.map(([number, title, copy]) => (
          <article key={number}>
            <p className="text-sm font-semibold tracking-[0.18em] text-white/50">{number}</p>
            <h3 className="mt-4 text-2xl font-bold">{title}</h3>
            <p className="mt-3 text-white/70">{copy}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`border-2 px-5 py-2 text-sm font-semibold ${active ? "border-white bg-white text-black" : "border-white/30 text-white"}`}
    >
      {children}
    </button>
  );
}
