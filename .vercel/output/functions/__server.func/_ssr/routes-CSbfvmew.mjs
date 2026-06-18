import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as Logo, t as Button } from "./button-DHpxc22r.mjs";
import { h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { E as Briefcase, O as ArrowRight, T as Building2, g as GraduationCap, h as HeartHandshake, n as Users, o as Sparkles, p as Lock, s as ShieldCheck, x as CircleCheck } from "../_libs/lucide-react.mjs";
import { t as motion } from "../_libs/framer-motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CSbfvmew.js
var import_jsx_runtime = require_jsx_runtime();
function Landing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hero, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stats, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HowItWorks, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Features, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ForPartners, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AiSupport, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClosingCta, {})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
function SiteHeader() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "flex items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { className: "h-8 w-auto" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#how",
							className: "hover:text-foreground",
							children: "How it works"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#features",
							className: "hover:text-foreground",
							children: "Features"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#partners",
							className: "hover:text-foreground",
							children: "For partners"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#ai",
							className: "hover:text-foreground",
							children: "AI support"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							children: "Sign in"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						search: { mode: "signup" },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							children: "Get started"
						})
					})]
				})
			]
		})
	});
}
function Hero() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "gradient-hero relative overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-6xl gap-16 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-28",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				initial: {
					opacity: 0,
					y: 24
				},
				animate: {
					opacity: 1,
					y: 0
				},
				transition: {
					duration: .7,
					ease: "easeOut"
				},
				className: "flex flex-col justify-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-1.5 rounded-full bg-accent" }), " Guided by values · Driven by people"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "text-balance text-4xl font-bold leading-[1.05] text-primary sm:text-5xl lg:text-6xl",
						children: [
							"A second chance,",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"built on ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-accent",
								children: "dignity"
							}),
							"."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground",
						children: "CAREVIA is a secure digital repository that connects survivors of violence, exploitation, and trauma with meaningful employment — through trusted NGOs, verified recruiters, and AI-powered career support."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex flex-wrap gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/auth",
							search: { mode: "signup" },
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "lg",
								className: "gap-2",
								children: ["Join the platform ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#how",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "lg",
								variant: "outline",
								children: "See how it works"
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex items-center gap-6 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-3.5" }), " End-to-end encrypted"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3.5" }), " Privacy first"]
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				initial: {
					opacity: 0,
					scale: .96
				},
				animate: {
					opacity: 1,
					scale: 1
				},
				transition: {
					duration: .8,
					delay: .15,
					ease: "easeOut"
				},
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -inset-6 -z-10 rounded-3xl bg-accent/20 blur-3xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-3xl border border-border bg-card p-6 shadow-2xl shadow-primary/10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 border-b border-border pb-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid size-10 place-items-center rounded-full bg-primary-soft text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold",
									children: "Candidate · CV-7A2F19"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Verified by Asha Foundation"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-auto rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success",
									children: "Ready"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "mt-5 grid grid-cols-2 gap-4 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Profile",
									value: "94%"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Resume",
									value: "A+"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Interview ready",
									value: "87%"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Applications",
									value: "12"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-5 space-y-2",
							children: [
								"Hospitality",
								"Customer support",
								"Tailoring"
							].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: s }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-success" })]
							}, s))
						})
					]
				})]
			})]
		})
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border border-border bg-background/60 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xl font-semibold text-primary",
			children: value
		})]
	});
}
function Stats() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "border-y border-border bg-card",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden px-0 sm:grid-cols-4",
			children: [
				{
					v: "1,200+",
					l: "Survivors supported"
				},
				{
					v: "85",
					l: "NGO partners"
				},
				{
					v: "320+",
					l: "Placements made"
				},
				{
					v: "100%",
					l: "Verified pathways"
				}
			].map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-card px-6 py-8 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-3xl font-bold text-primary sm:text-4xl",
					children: it.v
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: it.l
				})]
			}, it.l))
		})
	});
}
function HowItWorks() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "how",
		className: "mx-auto max-w-6xl px-4 py-24 sm:px-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
			kicker: "How it works",
			title: "A protected pathway from rescue to readiness",
			subtitle: "Every step is consent-first, privacy-first, and human-supported."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-14 grid gap-6 md:grid-cols-3",
			children: [
				{
					icon: HeartHandshake,
					title: "NGOs onboard survivors",
					body: "Trusted partner NGOs create verified profiles with consent, capturing skills, education, and aspirations."
				},
				{
					icon: Sparkles,
					title: "AI builds a ready profile",
					body: "Our AI mentor helps generate resumes, recommend skills, and coach for interviews — at the survivor's pace."
				},
				{
					icon: Briefcase,
					title: "Recruiters discover talent",
					body: "Verified recruiters search anonymized profiles, request introductions, and offer dignified employment."
				}
			].map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				initial: {
					opacity: 0,
					y: 16
				},
				animate: {
					opacity: 1,
					y: 0
				},
				transition: {
					duration: .5,
					delay: .1 + i * .08
				},
				className: "relative rounded-2xl border border-border bg-card p-7 shadow-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-11 place-items-center rounded-xl bg-primary-soft text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.icon, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mt-5 text-lg font-semibold text-primary",
						children: s.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed text-muted-foreground",
						children: s.body
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "absolute right-5 top-5 text-xs font-medium text-muted-foreground",
						children: ["0", i + 1]
					})
				]
			}, s.title))
		})]
	});
}
function Features() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "features",
		className: "bg-muted/40",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl px-4 py-24 sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
				kicker: "Platform",
				title: "Built for the people behind the profile",
				subtitle: "A complete operating system for survivor employment — secure, accessible, and humane."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
				children: [
					{
						icon: ShieldCheck,
						title: "Privacy by design",
						body: "End-to-end encryption, anonymized candidate IDs, and audit logs on every sensitive action."
					},
					{
						icon: GraduationCap,
						title: "AI career mentor",
						body: "Resume generation, mock interviews, and learning paths tailored to each survivor."
					},
					{
						icon: Building2,
						title: "NGO operations",
						body: "Manage assigned survivors, track placement progress, and upload verified documents."
					},
					{
						icon: Briefcase,
						title: "Verified recruiters",
						body: "Subscription-based access for recruiters with clear consent gates before contact."
					},
					{
						icon: Users,
						title: "Role-based access",
						body: "Five distinct roles with least-privilege access — survivors, NGOs, recruiters, admins."
					},
					{
						icon: Sparkles,
						title: "Readiness scores",
						body: "Visual progress for profile, resume, and interview readiness at a glance."
					}
				].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-card p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(f.icon, { className: "size-5 text-accent" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-4 font-semibold text-primary",
							children: f.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-sm text-muted-foreground",
							children: f.body
						})
					]
				}, f.title))
			})]
		})
	});
}
function ForPartners() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "partners",
		className: "mx-auto max-w-6xl px-4 py-24 sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-6 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartnerCard, {
				icon: HeartHandshake,
				tag: "For NGO partners",
				title: "Bring survivors to dignified work — faster",
				points: [
					"Securely onboard and manage your survivors",
					"Track readiness, placements, and progress",
					"Get matched with verified recruiters"
				],
				cta: "Partner with us"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PartnerCard, {
				icon: Briefcase,
				tag: "For recruiters",
				title: "Hire from a pool of verified, ready talent",
				points: [
					"Search anonymized profiles by skill",
					"Request introductions through NGOs",
					"Build your inclusive hiring footprint"
				],
				cta: "Become a recruiter",
				variant: "navy"
			})]
		})
	});
}
function PartnerCard({ icon: Icon, tag, title, points, cta, variant = "light" }) {
	const navy = variant === "navy";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `relative overflow-hidden rounded-3xl border p-8 ${navy ? "gradient-navy border-transparent text-primary-foreground" : "border-border bg-card"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `grid size-10 place-items-center rounded-xl ${navy ? "bg-white/10 text-accent" : "bg-primary-soft text-primary"}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `mt-5 text-xs font-medium uppercase tracking-wider ${navy ? "text-accent" : "text-accent-foreground/70"}`,
				children: tag
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: `mt-1 text-2xl font-semibold ${navy ? "text-white" : "text-primary"}`,
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: `mt-5 space-y-2 text-sm ${navy ? "text-white/85" : "text-muted-foreground"}`,
				children: points.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-start gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: `mt-0.5 size-4 ${navy ? "text-accent" : "text-success"}` }), p]
				}, p))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-7",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/auth",
					search: { mode: "signup" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: navy ? "secondary" : "default",
						className: "gap-2",
						children: [
							cta,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })
						]
					})
				})
			})
		]
	});
}
function AiSupport() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "ai",
		className: "bg-muted/40",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
				align: "left",
				kicker: "AI mentor",
				title: "A patient career companion, available any time",
				subtitle: "The CAREVIA AI mentor helps survivors build resumes, practice interviews, and learn new skills — in their own language and pace."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 space-y-3 text-sm text-muted-foreground",
				children: [
					"ATS-friendly resume generation",
					"Mock interview questions with feedback",
					"Personalised learning recommendations",
					"Workplace etiquette and expectations"
				].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-start gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mt-0.5 size-4 text-accent" }), x]
				}, x))
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -inset-4 -z-10 rounded-3xl bg-accent/15 blur-2xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-2xl border border-border bg-card p-5 shadow-xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatBubble, {
								role: "user",
								children: "Can you help me write a resume for a hotel front-desk job?"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatBubble, {
								role: "ai",
								children: "Of course. Tell me one thing you enjoyed in your last work or training — we'll start there."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatBubble, {
								role: "user",
								children: "I learned to welcome guests and manage check-in lists."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatBubble, {
								role: "ai",
								children: "Wonderful. I'll draft a resume highlighting hospitality, attention to detail, and Hindi & English communication."
							})
						]
					})
				})]
			})]
		})
	});
}
function ChatBubble({ role, children }) {
	const isUser = role === "user";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `flex ${isUser ? "justify-end" : "justify-start"}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `max-w-[85%] rounded-2xl px-4 py-2.5 ${isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`,
			children
		})
	});
}
function ClosingCta() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "mx-auto max-w-6xl px-4 py-24 sm:px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "gradient-navy relative overflow-hidden rounded-3xl px-8 py-16 text-center text-primary-foreground sm:px-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[radial-gradient(800px_400px_at_50%_-20%,rgba(255,255,255,0.18),transparent)]" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "relative font-display text-3xl font-bold sm:text-4xl",
					children: "Help build the next chapter — together."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "relative mx-auto mt-3 max-w-2xl text-white/80",
					children: "Whether you're an NGO supporting survivors or a recruiter who believes in inclusive hiring, CAREVIA gives you the tools to make impact at scale."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mt-7 flex flex-wrap justify-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						search: { mode: "signup" },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							variant: "secondary",
							children: "Create an account"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "lg",
							variant: "ghost",
							className: "text-white hover:bg-white/10 hover:text-white",
							children: "I already have an account"
						})
					})]
				})
			]
		})
	});
}
function SiteFooter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "border-t border-border bg-card",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, { className: "h-7 w-auto" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs",
					children: [
						"© ",
						(/* @__PURE__ */ new Date()).getFullYear(),
						" CAREVIA. Guided by values. Driven by people."
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-5 text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#",
						className: "hover:text-foreground",
						children: "Privacy"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#",
						className: "hover:text-foreground",
						children: "Terms"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#",
						className: "hover:text-foreground",
						children: "Contact"
					})
				]
			})]
		})
	});
}
function SectionHeading({ kicker, title, subtitle, align = "center" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold uppercase tracking-[0.18em] text-accent",
				children: kicker
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mt-3 font-display text-3xl font-bold text-primary sm:text-4xl",
				children: title
			}),
			subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-muted-foreground",
				children: subtitle
			})
		]
	});
}
//#endregion
export { Landing as component };
