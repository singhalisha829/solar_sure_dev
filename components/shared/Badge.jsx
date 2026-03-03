import React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/utils/utils";

const badgeVariants = cva(
  "px-3 py-1.5 rounded max-w-fit text-xs font-semibold capitalize",
  {
    variants: {
      variant: {
        active: "bg-green-600/10 text-green-600",
        inactive: "bg-rose-500/10 text-rose-500",
        inprogress: "bg-orange-400/10 text-orange-400",
        approved: "bg-green-600/10 text-green-600",
        paid: "bg-green-600/10 text-green-600",
        project_registration_incomplete: "bg-yellow-400/10 text-yellow-500",
        pending: "bg-yellow-400/10 text-yellow-500",
        on_hold: "bg-yellow-400/10 text-yellow-500",
        transportation_details_added: "bg-green-600/10 text-green-600",
        approval_pending_from_inroof_vice_president_sale:
          "bg-orange-400/10 text-orange-400",
        approval_pending_from__mraditya_goel_director:
          "bg-rose-500/10 text-rose-500",
        reject: "bg-rose-500/10 text-rose-500",
        rejected: "bg-rose-500/10 text-rose-500",
        sg: "bg-sggreen/10 text-sggreen",
        ornate: "bg-ornateblue/10 text-ornateblue",
        closed: "bg-orange-400/10 text-orange-400",
        hold: "bg-yellow-400/10 text-yellow-500",
        packing_list_created: "bg-ornateblue/10 text-ornateblue",
        bbu_approved: "bg-pink-400/10 text-pink-500",
        incomplete: "bg-orange-400/10 text-orange-400",
        cancelled: "bg-rose-500/10 text-rose-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Badge = ({ className, variant, ...props }) => {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
};
export { Badge, badgeVariants };
