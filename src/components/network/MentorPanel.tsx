import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Copy, Check, AlertTriangle } from "lucide-react";
import { useMentor } from "@/hooks/useMentor";
import { useHeartbeat } from "@/hooks/useHeartbeat";
import { ApiError } from "@/lib/apiClient";

const SUGGESTIONS = [
  "remote patient monitoring",
  "ER wait times",
  "medication adherence",
  "rural clinic access",
];

function friendlyError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case "rate_limited":
        return "You've hit the request limit for now — give it a minute and try again.";
      case "cap_reached":
        return "The live demo budget for this portfolio has been spent — that's the hard cost cap doing its job.";
      case "not_configured":
        return "The AI mentor isn't wired up in this environment yet.";
    }
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

export function MentorPanel() {
  const [topic, setTopic] = useState("");
  const [copied, setCopied] = useState(false);
  const mentor = useMentor();

  const submit = (value: string) => {
    const t = value.trim();
    if (t.length < 3 || mentor.isPending) return;
    setCopied(false);
    mentor.mutate(t);
  };

  const copy = async () => {
    if (!mentor.data) return;
    await navigator.clipboard.writeText(mentor.data.idea);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      <h2 className="section-title">03 // mentor uplink</h2>
      <p className="mb-2 max-w-2xl font-sans text-base leading-relaxed text-vira-fg">
        An AI hackathon-idea generator. Type a healthcare topic you care about and get back one
        concrete, buildable project idea — the problem it solves, what to build, and a stretch goal.
      </p>
      <p className="mb-6 max-w-2xl font-mono text-xs leading-relaxed text-vira-subtle">
        powered by Claude · <NetworkHeartbeat />
      </p>

      <div className="mx-auto max-w-2xl rounded-lg border border-solid border-vira-border p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(topic);
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <label htmlFor="mentor-topic" className="sr-only">
            Topic or interest
          </label>
          <input
            id="mentor-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="a healthcare topic — e.g. ER wait times, medication adherence"
            maxLength={200}
            className="w-full flex-1 rounded-md border border-solid border-vira-border bg-transparent px-3 py-2 font-mono text-sm text-vira-fg outline-none transition-colors focus:border-vira-accent"
          />
          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            disabled={mentor.isPending || topic.trim().length < 3}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-solid border-vira-accent bg-vira-accent px-4 py-2 font-mono text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {mentor.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden />
            )}
            {mentor.isPending ? "generating…" : "get idea"}
          </motion.button>
        </form>

        {!mentor.data && !mentor.isPending && !mentor.isError && (
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setTopic(s);
                  submit(s);
                }}
                className="rounded-full border border-solid border-vira-border px-3 py-1 font-mono text-xs text-vira-muted transition-colors hover:border-vira-accent hover:text-vira-accent"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {mentor.isError && (
            <motion.div
              key="err"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex items-start gap-2 rounded-md border border-solid border-vira-border bg-vira-hover p-3 font-mono text-xs text-vira-muted"
              role="alert"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-vira-accent-pending" aria-hidden />
              <span>{friendlyError(mentor.error)}</span>
            </motion.div>
          )}
          {mentor.data && (
            <motion.div
              key="idea"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-md border border-solid border-vira-border bg-vira-hover p-4"
            >
              <p className="whitespace-pre-line font-sans text-sm leading-relaxed text-vira-fg">
                {mentor.data.idea}
              </p>
              <div className="mt-3 flex items-center justify-between font-mono text-[0.65rem] uppercase tracking-wide text-vira-subtle">
                <span>
                  {mentor.data.cached
                    ? "served from cache · no tokens spent"
                    : `generations remaining: ${mentor.data.remaining}`}
                </span>
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex items-center gap-1 transition-colors hover:text-vira-accent"
                >
                  {copied ? <Check className="h-3 w-3" aria-hidden /> : <Copy className="h-3 w-3" aria-hidden />}
                  {copied ? "copied" : "copy"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function NetworkHeartbeat() {
  const { heartbeat } = useHeartbeat();
  const online = heartbeat.status === "online";
  return (
    <span className="mono" title={online ? `infra repo: ${heartbeat.source}` : "live heartbeat on standby"}>
      <span
        className="map-marker-dot"
        style={{
          display: "inline-block",
          width: 7,
          height: 7,
          borderRadius: "50%",
          marginRight: 5,
          background: online ? "var(--accent)" : "var(--text-tertiary)",
        }}
      />
      {online ? `network: online${heartbeat.stars != null ? ` · ${heartbeat.stars}★` : ""}` : "network: standby"}
    </span>
  );
}
