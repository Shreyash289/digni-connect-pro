import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-pFu6bPsK.mjs";
import { t as createServerRpc } from "./createServerRpc-TAUNrjZd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/analytics.functions-DafiDuoC.js
var getAdminAnalytics_createServerFn_handler = createServerRpc({
	id: "52a55324d8a6e06dd67ad67256b022a8674c46d777604cbee675d6fb01db9853",
	name: "getAdminAnalytics",
	filename: "src/lib/analytics.functions.ts"
}, (opts) => getAdminAnalytics.__executeServer(opts));
var getAdminAnalytics = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(getAdminAnalytics_createServerFn_handler, async ({ context }) => {
	const { supabase, userId } = context;
	const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: userId });
	if (!isAdmin) throw new Error("Admin only");
	const [survivors, ngos, pendingNgos, pendingRecruiters, intros, acceptedIntros, jobs, publishedJobs, applications, hires, flaggedMessages] = await Promise.all([
		supabase.from("survivors").select("id", {
			count: "exact",
			head: true
		}),
		supabase.from("ngos").select("id", {
			count: "exact",
			head: true
		}).eq("status", "approved"),
		supabase.from("ngos").select("id", {
			count: "exact",
			head: true
		}).eq("status", "pending"),
		supabase.from("recruiters").select("id", {
			count: "exact",
			head: true
		}).eq("verification_status", "pending"),
		supabase.from("introduction_requests").select("id", {
			count: "exact",
			head: true
		}),
		supabase.from("introduction_requests").select("id", {
			count: "exact",
			head: true
		}).eq("status", "accepted"),
		supabase.from("jobs").select("id", {
			count: "exact",
			head: true
		}),
		supabase.from("jobs").select("id", {
			count: "exact",
			head: true
		}).eq("status", "published"),
		supabase.from("job_applications").select("id", {
			count: "exact",
			head: true
		}),
		supabase.from("job_applications").select("id", {
			count: "exact",
			head: true
		}).eq("status", "hired"),
		supabase.from("mentor_messages").select("id", {
			count: "exact",
			head: true
		}).eq("safety_flagged", true)
	]);
	return {
		totalSurvivors: survivors.count ?? 0,
		activeNgos: ngos.count ?? 0,
		pendingNgoApprovals: pendingNgos.count ?? 0,
		pendingRecruiterApprovals: pendingRecruiters.count ?? 0,
		introductionsSent: intros.count ?? 0,
		introductionsAccepted: acceptedIntros.count ?? 0,
		jobsPosted: jobs.count ?? 0,
		jobsPublished: publishedJobs.count ?? 0,
		applicationsSubmitted: applications.count ?? 0,
		hires: hires.count ?? 0,
		safetyFlaggedMessages: flaggedMessages.count ?? 0
	};
});
var getNgoAnalytics_createServerFn_handler = createServerRpc({
	id: "f78bbfe42ddf4f99c8c694c0f4cfc2580fffd5e47b2d1dd9302c4399c68459c4",
	name: "getNgoAnalytics",
	filename: "src/lib/analytics.functions.ts"
}, (opts) => getNgoAnalytics.__executeServer(opts));
var getNgoAnalytics = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(getNgoAnalytics_createServerFn_handler, async ({ context }) => {
	const { supabase, userId } = context;
	const { data: ngo } = await supabase.from("ngos").select("id").eq("owner_id", userId).single();
	if (!ngo) throw new Error("NGO not found");
	const [survivors, intros, acceptedIntros, applications, hires, threads] = await Promise.all([
		supabase.from("survivors").select("profile_completion").eq("ngo_id", ngo.id),
		supabase.from("introduction_requests").select("id", {
			count: "exact",
			head: true
		}).eq("ngo_id", ngo.id),
		supabase.from("introduction_requests").select("id", {
			count: "exact",
			head: true
		}).eq("ngo_id", ngo.id).eq("status", "accepted"),
		supabase.from("job_applications").select("id", {
			count: "exact",
			head: true
		}).eq("ngo_id", ngo.id),
		supabase.from("job_applications").select("id", {
			count: "exact",
			head: true
		}).eq("ngo_id", ngo.id).eq("status", "hired"),
		supabase.from("mentor_threads").select("id", {
			count: "exact",
			head: true
		}).eq("user_id", userId)
	]);
	const completions = survivors.data?.map((s) => s.profile_completion) ?? [];
	const avgCompletion = completions.length > 0 ? completions.reduce((a, b) => a + b, 0) / completions.length : 0;
	return {
		survivorsManaged: completions.length,
		avgProfileCompletion: Math.round(avgCompletion),
		introsReceived: intros.count ?? 0,
		introsAccepted: acceptedIntros.count ?? 0,
		applicationsSubmitted: applications.count ?? 0,
		hires: hires.count ?? 0,
		mentorSessions: threads.count ?? 0
	};
});
var getRecruiterAnalytics_createServerFn_handler = createServerRpc({
	id: "eb999d63774b4337aad690ce403056ce1b08bd621f83fd3376e250495ec98e4d",
	name: "getRecruiterAnalytics",
	filename: "src/lib/analytics.functions.ts"
}, (opts) => getRecruiterAnalytics.__executeServer(opts));
var getRecruiterAnalytics = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(getRecruiterAnalytics_createServerFn_handler, async ({ context }) => {
	const { supabase, userId } = context;
	const { data: recruiter } = await supabase.from("recruiters").select("id").eq("user_id", userId).single();
	if (!recruiter) throw new Error("Recruiter not found");
	const [activeJobs, intros, acceptedIntros, applications, hires] = await Promise.all([
		supabase.from("jobs").select("id", {
			count: "exact",
			head: true
		}).eq("recruiter_id", recruiter.id).eq("status", "published"),
		supabase.from("introduction_requests").select("id", {
			count: "exact",
			head: true
		}).eq("recruiter_id", recruiter.id),
		supabase.from("introduction_requests").select("id", {
			count: "exact",
			head: true
		}).eq("recruiter_id", recruiter.id).eq("status", "accepted"),
		supabase.from("job_applications").select("id", {
			count: "exact",
			head: true
		}).in("job_id", (await supabase.from("jobs").select("id").eq("recruiter_id", recruiter.id)).data?.map((j) => j.id) ?? []),
		supabase.from("job_applications").select("id", {
			count: "exact",
			head: true
		}).eq("status", "hired").in("job_id", (await supabase.from("jobs").select("id").eq("recruiter_id", recruiter.id)).data?.map((j) => j.id) ?? [])
	]);
	return {
		activeJobs: activeJobs.count ?? 0,
		introsSent: intros.count ?? 0,
		introsAccepted: acceptedIntros.count ?? 0,
		applicationsReceived: applications.count ?? 0,
		hires: hires.count ?? 0
	};
});
var exportAdminCsv_createServerFn_handler = createServerRpc({
	id: "9592e7244ab19b915707bdf1aba80ffccbc51ac6b74fd8aebd57a8d0dae72fd7",
	name: "exportAdminCsv",
	filename: "src/lib/analytics.functions.ts"
}, (opts) => exportAdminCsv.__executeServer(opts));
var exportAdminCsv = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(exportAdminCsv_createServerFn_handler, async ({ context }) => {
	const { supabase, userId } = context;
	const { data: isAdmin } = await supabase.rpc("is_admin", { _user_id: userId });
	if (!isAdmin) throw new Error("Admin only");
	const { data: survivors } = await supabase.from("survivors").select("anonymous_id, status, profile_completion, location_country, searchable, created_at");
	return { csv: "anonymous_id,status,profile_completion,location_country,searchable,created_at\n" + (survivors ?? []).map((s) => `${s.anonymous_id},${s.status},${s.profile_completion},${s.location_country ?? ""},${s.searchable},${s.created_at}`).join("\n") };
});
//#endregion
export { exportAdminCsv_createServerFn_handler, getAdminAnalytics_createServerFn_handler, getNgoAnalytics_createServerFn_handler, getRecruiterAnalytics_createServerFn_handler };
