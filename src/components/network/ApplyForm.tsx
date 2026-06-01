import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { ApplicationSchema, type Application } from "@/lib/schema";
import { US_STATES } from "@/data/usGeo";
import { useApplyToChapter } from "@/hooks/useApplyToChapter";
import { ApiError } from "@/lib/apiClient";

const FIELD =
  "w-full rounded-md border border-solid border-vira-border bg-transparent px-3 py-2 font-mono text-sm text-vira-fg outline-none transition-colors focus:border-vira-accent";

export function ApplyForm() {
  const apply = useApplyToChapter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Application>({
    resolver: zodResolver(ApplicationSchema),
    defaultValues: { name: "", email: "", school: "", state: "", city: "", message: "", company: "" },
  });

  const onSubmit = (values: Application) => {
    apply.mutate(values, {
      onSuccess: () => {
        toast.success("Node provisioned — application pending review.");
        reset();
      },
      onError: (err) => {
        const msg =
          err instanceof ApiError && err.code === "rate_limited"
            ? "Too many submissions — try again later."
            : err instanceof ApiError && err.code === "not_configured"
              ? "Applications aren't wired up in this environment yet."
              : "Couldn't submit — please try again.";
        toast.error(msg);
      },
    });
  };

  return (
    <div>
      <h2 className="section-title">04 // request node</h2>
      <p className="mb-6 max-w-2xl font-mono text-sm leading-relaxed text-vira-subtle">
        Apply to deploy a Vira chapter at your school. Submitting drops a pending node on the map
        instantly — it stays private and is emailed to the network operator for review.
      </p>

      {apply.isSuccess ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto flex max-w-2xl items-start gap-3 rounded-lg border border-solid border-vira-accent bg-vira-hover p-5"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-vira-accent" aria-hidden />
          <div className="font-mono text-sm text-vira-fg">
            <p className="font-medium">Application transmitted.</p>
            <p className="mt-1 text-vira-muted">
              Your node is pending review. Look at the map — your school is on the network.
            </p>
            <button onClick={() => apply.reset()} className="mt-3 bg-transparent text-xs text-vira-accent hover:underline">
              submit another →
            </button>
          </div>
        </motion.div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2"
          noValidate
        >
          {/* Honeypot: hidden from users, tempting to bots. Server rejects if filled. */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
            {...register("company")}
          />

          <Field label="Name" error={errors.name?.message}>
            <input className={FIELD} placeholder="your name" autoComplete="name" {...register("name")} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input className={FIELD} type="email" placeholder="you@email.com" autoComplete="email" {...register("email")} />
          </Field>
          <Field label="School" error={errors.school?.message} full>
            <input className={FIELD} placeholder="your high school" {...register("school")} />
          </Field>
          <Field label="State" error={errors.state?.message}>
            <select className={FIELD} defaultValue="" {...register("state")}>
              <option value="" disabled>
                select state
              </option>
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="City" error={errors.city?.message}>
            <input className={FIELD} placeholder="city" {...register("city")} />
          </Field>
          <Field label="Why Vira? (optional)" error={errors.message?.message} full>
            <textarea
              className={`${FIELD} min-h-[90px] resize-y`}
              placeholder="tell us about your school..."
              {...register("message")}
            />
          </Field>

          <div className="sm:col-span-2">
            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              disabled={apply.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-solid border-vira-accent bg-vira-accent px-5 py-2.5 font-mono text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            >
              {apply.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Send className="h-4 w-4" aria-hidden />
              )}
              {apply.isPending ? "transmitting" : "request node"}
            </motion.button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  error,
  full,
  children,
}: {
  label: string;
  error?: string;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="mb-1 block font-mono text-[0.65rem] uppercase tracking-wide text-vira-subtle">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 font-mono text-xs text-vira-accent-pending" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
