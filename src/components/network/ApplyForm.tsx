import type { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { ApplicationSchema, type Application } from "@/lib/schema";
import { US_STATES } from "@/data/usGeo";
import { useApplyToChapter } from "@/hooks/useApplyToChapter";
import { ApiError } from "@/lib/apiClient";

const FIELD = "sminput";

const NEXT = [
  { t: "Submit the form", d: "Your school appears on the map as a pending node right away." },
  { t: "Operator review", d: "The application is emailed to the network operator. Your details stay private." },
  { t: "Provisioning", d: "Playbook, sponsor kit, judging rubric and a mentor bench land in your inbox." },
];

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
        toast.success("Application sent — your node is pending review.");
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
    <div className="smapply">
      <div className="smapply-copy">
        <div className="idx-label">Apply · one short form</div>
        <h3>Bring a chapter to your school.</h3>
        <p>
          Any high school, any state. An existing club helps but isn&rsquo;t required.
        </p>
        <ol className="smapply-steps">
          {NEXT.map((n, i) => (
            <li key={n.t}>
              <span className="n">0{i + 1}</span>
              <div>
                <b>{n.t}</b>
                <span>{n.d}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {apply.isSuccess ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="smform smform-done"
        >
          <CheckCircle2 className="ico" aria-hidden />
          <div>
            <b>Application sent.</b>
            <p>Your node is pending review. Look at the map — your school is on the network.</p>
            <button type="button" onClick={() => apply.reset()}>Submit another →</button>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="smform" noValidate>
          {/* Honeypot: hidden from users, tempting to bots. Server rejects if filled. */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
            {...register("company")}
          />

          <Field id="apply-name" label="Name" error={errors.name?.message}>
            <input id="apply-name" className={FIELD} placeholder="Your name" autoComplete="name" {...register("name")} />
          </Field>
          <Field id="apply-email" label="Email" error={errors.email?.message}>
            <input id="apply-email" className={FIELD} type="email" placeholder="you@email.com" autoComplete="email" {...register("email")} />
          </Field>
          <Field id="apply-school" label="School" error={errors.school?.message} full>
            <input id="apply-school" className={FIELD} placeholder="Your high school" {...register("school")} />
          </Field>
          <Field id="apply-state" label="State" error={errors.state?.message}>
            <select id="apply-state" className={FIELD} defaultValue="" {...register("state")}>
              <option value="" disabled>
                Select state
              </option>
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field id="apply-city" label="City" error={errors.city?.message}>
            <input id="apply-city" className={FIELD} placeholder="City" {...register("city")} />
          </Field>
          <Field id="apply-message" label="Why Vira? (optional)" error={errors.message?.message} full>
            <textarea
              id="apply-message"
              className={FIELD}
              placeholder="Tell us about your school…"
              {...register("message")}
            />
          </Field>

          <div className="smform-foot">
            <button type="submit" disabled={apply.isPending} className="smbtn primary">
              {apply.isPending ? "Sending…" : "Request a chapter"}
              <span className="arr-cell">
                {apply.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <span className="arr" aria-hidden="true">→</span>
                )}
              </span>
            </button>
            <span className="fine">Private — never shown publicly.</span>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  id,
  label,
  error,
  full,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`smfield ${full ? "full" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p className="err" role="alert">{error}</p>}
    </div>
  );
}
