import { o as __toESM } from "../_runtime.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { o as require_react } from "../_libs/@ai-sdk/react+[...].mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as Button } from "./button-DHpxc22r.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as createServerFn } from "./esm-9EjmF9OT.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-pFu6bPsK.mjs";
import { t as createSsrRpc } from "./createSsrRpc-CnhdtqBy.mjs";
import { Ct as stringType, St as objectType, bt as enumType, vt as arrayType, xt as numberType, yt as booleanType } from "../_libs/@ai-sdk/gateway+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { _ as FileText, a as Trash2, k as ArrowLeft, m as LoaderCircle, r as Upload, x as CircleCheck } from "../_libs/lucide-react.mjs";
import { t as PortalShell } from "./PortalShell-DPiHV71Y.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Textarea } from "./textarea-kko37XEX.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as StatusBadge } from "./ngo.dashboard-lcMfFS7g.mjs";
import { t as Input } from "./input-B8Q2ztVi.mjs";
import { t as Label } from "./label-DBD1bRRP.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CCJRliUM.mjs";
import { t as Route } from "./ngo.survivors._id-D8i8NIA0.mjs";
import { t as Switch } from "./switch-Cn1w-cIH.mjs";
import { n as useForm, t as u } from "../_libs/@hookform/resolvers+[...].mjs";
import { n as Root, t as Indicator } from "../_libs/radix-ui__react-progress.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ngo.survivors._id-DX21-T5n.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Progress = import_react.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Indicator, {
		className: "h-full w-full flex-1 bg-primary transition-all",
		style: { transform: `translateX(-${100 - (value || 0)}%)` }
	})
}));
Progress.displayName = Root.displayName;
var certificationSchema = objectType({
	name: stringType(),
	issuer: stringType(),
	year: numberType().optional(),
	url: stringType().url().optional()
});
var workHistorySchema = objectType({
	role: stringType(),
	org: stringType(),
	start: stringType(),
	end: stringType().optional(),
	description: stringType().optional()
});
var educationSchema = objectType({
	level: stringType(),
	institution: stringType(),
	field: stringType().optional(),
	year: numberType().optional()
});
var profilePatchSchema = objectType({
	pronouns: stringType().max(50).optional(),
	date_of_birth: stringType().nullable().optional(),
	gender: stringType().max(50).optional(),
	languages: arrayType(stringType()).optional(),
	location_country: stringType().max(100).optional(),
	location_region: stringType().max(100).optional(),
	bio: stringType().max(2e3).optional(),
	skills: arrayType(stringType()).optional(),
	certifications: arrayType(certificationSchema).optional(),
	work_history: arrayType(workHistorySchema).optional(),
	education: arrayType(educationSchema).optional(),
	interests: arrayType(stringType()).optional(),
	availability: enumType([
		"full_time",
		"part_time",
		"remote",
		"onsite",
		"flexible"
	]).optional(),
	consent_share_with_recruiters: booleanType().optional(),
	consent_ai_processing: booleanType().optional()
});
var getSurvivorDetail = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({ id: stringType().uuid() })).handler(createSsrRpc("b7a4981dafb703e0e2e08ff52cefa0e97e4cd53d4655fed2c17f305fc8b38dbc"));
var updateSurvivorProfile = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	id: stringType().uuid(),
	patch: profilePatchSchema
})).handler(createSsrRpc("3eb347d9ef2d1599c650206e4b718495655c4ac641c08ddbd79e5f748c95a091"));
var uploadSurvivorDocument = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	survivorId: stringType().uuid(),
	fileName: stringType().min(1).max(255),
	mimeType: stringType(),
	sizeBytes: numberType().positive().max(10485760),
	kind: enumType([
		"ID",
		"Certificate",
		"Reference",
		"Medical",
		"Other"
	])
})).handler(createSsrRpc("a4e06d520b8004e8b43537c474ac81c39db1c5187ea5988326ac7520d6bc9267"));
var deleteSurvivorDocument = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({ docId: stringType().uuid() })).handler(createSsrRpc("e7cff9b5d637af3bb43625b02faeac3479ea4415d2168c4f7f3b28e345c332fd"));
var getSignedDocumentUrl = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	docId: stringType().uuid(),
	ttlSeconds: numberType().min(60).max(300).default(300)
})).handler(createSsrRpc("0bd9677271185ee7ae790773f53fc7121d68bd4ce3598717e8233eda0a8159dd"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({ id: stringType().uuid() })).handler(createSsrRpc("107ebfe9c626cccd440c10be618bbca8ca4c0d51bf885a30125d9ec8e08d78ae"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({ query: stringType().max(100).default("") })).handler(createSsrRpc("ea31354dcacf9249dfc4c8eb6b7afa596f1c58317a8444aebc2b14d30db21df2"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({ id: stringType().uuid() })).handler(createSsrRpc("4475024260a7e65ae97f24152c6a1c7dcf57d4f0c1c9730f29919c4f7f54ce01"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({ id: stringType().uuid() })).handler(createSsrRpc("cf9aa5246c81a254c63187a0983e548ee631519a8a07da7be9b9ae915a967cce"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	jobId: stringType().uuid().optional(),
	survivorId: stringType().uuid().optional(),
	topK: numberType().int().min(1).max(50).default(20)
})).handler(createSsrRpc("75423c3c990ab5fd7c811a7de9155acc9e806084a0cc723b86f1e51dbea0c668"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	jobId: stringType().uuid(),
	topK: numberType().default(10)
})).handler(createSsrRpc("3e8adb2e169a4b426bd5e57aacf822572d82c909471406f76e9fd8bbe29159ff"));
var getMatchScoresForSurvivor = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator(objectType({
	survivorId: stringType().uuid(),
	topK: numberType().default(10)
})).handler(createSsrRpc("8afc4f1944e1dea4696e9d64263b656002aab6ed2f624a9b6c4fa2b45ddc2f1f"));
var NGO_NAV = [
	{
		to: "/ngo/dashboard",
		label: "Dashboard"
	},
	{
		to: "/ngo/survivors",
		label: "Survivors"
	},
	{
		to: "/ngo/requests",
		label: "Intro requests"
	},
	{
		to: "/ngo/analytics",
		label: "Analytics"
	},
	{
		to: "/ngo/organization",
		label: "Organization"
	}
];
var profileSchema = objectType({
	pronouns: stringType().optional(),
	bio: stringType().max(2e3).optional(),
	location_country: stringType().optional(),
	location_region: stringType().optional(),
	languages: stringType().optional(),
	skills: stringType().optional(),
	availability: stringType().optional(),
	consent_share_with_recruiters: booleanType(),
	consent_ai_processing: booleanType()
});
function SurvivorEditor() {
	const { id } = Route.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortalShell, {
		title: "NGO Portal",
		nav: NGO_NAV,
		allow: [
			"ngo_partner",
			"admin",
			"super_admin"
		],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorInner, { id })
	});
}
function EditorInner({ id }) {
	const qc = useQueryClient();
	const { data: survivor, isLoading } = useQuery({
		queryKey: ["survivor", id],
		queryFn: () => getSurvivorDetail({ data: { id } })
	});
	const { data: jobMatches } = useQuery({
		queryKey: ["survivor-matches", id],
		enabled: !!survivor,
		queryFn: () => getMatchScoresForSurvivor({ data: {
			survivorId: id,
			topK: 5
		} })
	});
	const form = useForm({
		resolver: u(profileSchema),
		values: survivor ? {
			pronouns: survivor.pronouns ?? "",
			bio: survivor.bio ?? "",
			location_country: survivor.location_country ?? survivor.country ?? "",
			location_region: survivor.location_region ?? survivor.state ?? "",
			languages: (survivor.languages ?? []).join(", "),
			skills: (survivor.skills ?? []).join(", "),
			availability: survivor.availability ?? "",
			consent_share_with_recruiters: survivor.consent_share_with_recruiters ?? false,
			consent_ai_processing: survivor.consent_ai_processing ?? false
		} : void 0
	});
	const save = useMutation({
		mutationFn: (patch) => updateSurvivorProfile({ data: {
			id,
			patch
		} }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["survivor", id] });
			toast.success("Saved");
		},
		onError: (e) => toast.error(e.message)
	});
	const onBlurSave = (0, import_react.useCallback)((fields) => {
		const values = form.getValues();
		const patch = {};
		for (const f of fields) if (f === "languages" || f === "skills") patch[f] = String(values[f]).split(",").map((s) => s.trim()).filter(Boolean);
		else patch[f] = values[f];
		save.mutate(patch);
	}, [form, save]);
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid place-items-center py-24",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-6 animate-spin" })
	});
	if (!survivor) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Survivor not found" });
	const docs = (survivor.survivor_documents ?? []).filter((d) => d.status !== "deleted");
	const readyForRecruiters = survivor.consent_share_with_recruiters && survivor.profile_completion >= 60;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-start justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/ngo/survivors",
					className: "mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Back to survivors"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-bold text-primary",
					children: survivor.full_name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: [
						survivor.anonymous_id,
						" · ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: survivor.status })
					]
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-48 space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Profile completion" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-medium",
							children: [survivor.profile_completion, "%"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, { value: survivor.profile_completion }),
					readyForRecruiters ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						className: "bg-success/15 text-success",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mr-1 size-3" }), " Recruiter-ready"]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Needs 60% completion + consent for recruiter visibility"
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			defaultValue: "identity",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "identity",
						children: "Identity"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "background",
						children: "Background"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "skills",
						children: "Skills"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
						value: "documents",
						children: [
							"Documents (",
							docs.length,
							")"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "consents",
						children: "Consents"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "matches",
						children: "Job matches"
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "identity",
					className: "mt-4 space-y-4 rounded-2xl border border-border bg-card p-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Anonymous ID" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-2",
							value: survivor.anonymous_id,
							disabled: true
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Pronouns" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-2",
							...form.register("pronouns"),
							onBlur: () => onBlurSave(["pronouns"])
						})] })]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "background",
					className: "mt-4 space-y-4 rounded-2xl border border-border bg-card p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Bio (markdown, max 2000 chars)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							className: "mt-2",
							rows: 6,
							...form.register("bio"),
							onBlur: () => onBlurSave(["bio"])
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Country (region only, no street address)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "mt-2",
								...form.register("location_country"),
								onBlur: () => onBlurSave(["location_country"])
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Region / State" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "mt-2",
								...form.register("location_region"),
								onBlur: () => onBlurSave(["location_region"])
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Languages (ISO codes, comma separated)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "mt-2",
							...form.register("languages"),
							onBlur: () => onBlurSave(["languages"]),
							placeholder: "en, hi, bn"
						})] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "skills",
					className: "mt-4 space-y-4 rounded-2xl border border-border bg-card p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Skills (comma separated)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "mt-2",
						...form.register("skills"),
						onBlur: () => onBlurSave(["skills"])
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Availability" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						className: "mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
						...form.register("availability"),
						onBlur: () => onBlurSave(["availability"]),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "",
								children: "Select…"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "full_time",
								children: "Full time"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "part_time",
								children: "Part time"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "remote",
								children: "Remote"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "onsite",
								children: "On-site"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "flexible",
								children: "Flexible"
							})
						]
					})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "documents",
					className: "mt-4 space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocumentUploader, {
						survivorId: id,
						onUploaded: () => qc.invalidateQueries({ queryKey: ["survivor", id] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-2xl border border-border bg-card divide-y divide-border",
						children: docs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "p-6 text-center text-sm text-muted-foreground",
							children: "No documents uploaded yet"
						}) : docs.map((doc) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocumentRow, {
							doc,
							onDelete: () => qc.invalidateQueries({ queryKey: ["survivor", id] })
						}, doc.id))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
					value: "consents",
					className: "mt-4 space-y-4 rounded-2xl border border-border bg-card p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConsentToggle, {
						label: "Share anonymized profile with recruiters",
						description: "Required before recruiters can discover this survivor. Only anonymous data is shared.",
						checked: form.watch("consent_share_with_recruiters"),
						changedAt: survivor.consent_share_changed_at,
						onChange: (v) => {
							form.setValue("consent_share_with_recruiters", v);
							save.mutate({ consent_share_with_recruiters: v });
						}
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConsentToggle, {
						label: "Allow AI processing of profile data",
						description: "Enables AI mentor to use profile context and job matching.",
						checked: form.watch("consent_ai_processing"),
						changedAt: survivor.consent_ai_changed_at,
						onChange: (v) => {
							form.setValue("consent_ai_processing", v);
							save.mutate({ consent_ai_processing: v });
						}
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
					value: "matches",
					className: "mt-4 space-y-3",
					children: !jobMatches || jobMatches.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground",
						children: "No job matches yet. Complete the profile and enable AI consent to generate matches."
					}) : jobMatches.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-border bg-card p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: m.jobs?.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: m.jobs?.company_name
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "secondary",
								children: [Math.round(Number(m.score) * 100), "% match"]
							})]
						}), m.breakdown?.reasons && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 text-xs text-muted-foreground",
							children: m.breakdown.reasons.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["• ", r] }, r))
						})]
					}, m.id))
				})
			]
		})]
	});
}
function ConsentToggle({ label, description, checked, changedAt, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start justify-between gap-4 rounded-xl border border-border p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-medium",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: description
			}),
			changedAt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: ["Last changed: ", new Date(changedAt).toLocaleString()]
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			checked,
			onCheckedChange: onChange
		})]
	});
}
function DocumentUploader({ survivorId, onUploaded }) {
	const [uploading, setUploading] = (0, import_react.useState)(false);
	async function handleFiles(files) {
		if (!files?.length) return;
		setUploading(true);
		for (const file of Array.from(files)) try {
			const { uploadUrl, token } = await uploadSurvivorDocument({ data: {
				survivorId,
				fileName: file.name,
				mimeType: file.type || "application/octet-stream",
				sizeBytes: file.size,
				kind: "Other"
			} });
			await fetch(uploadUrl, {
				method: "PUT",
				headers: {
					"Content-Type": file.type,
					...token ? { "x-upsert": "true" } : {}
				},
				body: file
			});
			toast.success(`Uploaded ${file.name}`);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Upload failed");
		}
		setUploading(false);
		onUploaded();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card p-8 transition-colors hover:border-accent hover:bg-accent/5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-8 text-muted-foreground" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm font-medium",
				children: uploading ? "Uploading…" : "Drop files or click to upload"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Max 10 MB · ID, Certificate, Reference, Medical, Other"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "file",
				className: "hidden",
				multiple: true,
				onChange: (e) => handleFiles(e.target.files),
				disabled: uploading
			})
		]
	});
}
function DocumentRow({ doc, onDelete }) {
	const download = async () => {
		const { url } = await getSignedDocumentUrl({ data: { docId: doc.id } });
		window.open(url, "_blank");
	};
	const remove = async () => {
		await deleteSurvivorDocument({ data: { docId: doc.id } });
		toast.success("Document removed");
		onDelete();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-4 px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: doc.file_name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
				variant: "outline",
				className: "mt-0.5 text-xs",
				children: doc.doc_type
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: download,
				children: "Download"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: remove,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
			})]
		})]
	});
}
//#endregion
export { SurvivorEditor as component };
