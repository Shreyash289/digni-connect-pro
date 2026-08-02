import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Trash2,
  Sparkles,
  Download,
  Save,
  CheckCircle2,
  FileText,
  User,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Wrench,
  Award,
  Globe,
  PlusCircle,
} from "lucide-react";
import { PortalShell } from "@/components/layout/PortalShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  getOrCreateSurvivorProfile,
} from "@/lib/survivors.functions";
import {
  saveResumeBuilderData,
  getResumeBuilderData,
  generateSummaryAi,
  improveTextAi,
} from "@/lib/resume-builder.functions";

export const Route = createFileRoute("/mentor/builder")({
  head: () => ({ meta: [{ title: "AI Resume Builder · CAREVIA" }] }),
  component: ResumeBuilderPage,
});

const MENTOR_NAV = [
  { to: "/mentor", label: "Conversations" },
  { to: "/mentor/resume", label: "Resume" },
  { to: "/mentor/builder", label: "Resume Builder" },
];

const PRESET_SKILLS = [
  "Python", "Java", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Express",
  "MongoDB", "PostgreSQL", "SQL", "HTML", "CSS", "TailwindCSS", "Git", "GitHub", "Docker",
  "AWS", "Linux", "Excel", "Data Analysis", "Communication", "Problem Solving", "Customer Service"
];

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    portfolio: string;
    address: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  summary: string;
  education: {
    degree: string;
    university: string;
    branch: string;
    cgpa: string;
    percentage: string;
    startYear: string;
    endYear: string;
    current: boolean;
  }[];
  experience: {
    company: string;
    position: string;
    internship: boolean;
    description: string;
    start: string;
    end: string;
    current: boolean;
  }[];
  projects: {
    title: string;
    description: string;
    technologies: string;
    github: string;
    liveLink: string;
  }[];
  skills: string[];
  certifications: {
    name: string;
    organization: string;
    date: string;
    credentialUrl: string;
  }[];
  achievements: string[];
  languages: string[];
  additional: {
    volunteerWork: string;
    research: string;
    publications: string;
    interests: string;
    hackathons: string;
    awards: string;
    references: string;
  };
}

const initialResumeState: ResumeData = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    portfolio: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  },
  summary: "",
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certifications: [],
  achievements: [],
  languages: [],
  additional: {
    volunteerWork: "",
    research: "",
    publications: "",
    interests: "",
    hackathons: "",
    awards: "",
    references: "",
  },
};

function ResumeBuilderPage() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeState);
  const [selectedTemplate, setSelectedTemplate] = useState<"professional" | "modern" | "minimal" | "ats">("professional");
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  // Get profile to load initial data if available
  const { data: survivor, isLoading } = useQuery({
    queryKey: ["my-survivor-profile"],
    queryFn: () => getOrCreateSurvivorProfile(),
  });

  useEffect(() => {
    if (survivor?.resume_builder_data && Object.keys(survivor.resume_builder_data).length > 0) {
      setResumeData({
        ...initialResumeState,
        ...(survivor.resume_builder_data as unknown as ResumeData),
      });
    } else if (survivor) {
      // Pre-fill profile fields if we have a profile but no resume builder data yet
      setResumeData((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          fullName: survivor.full_name || "",
          email: survivor.email || "",
          phone: survivor.phone || "",
          city: survivor.city || "",
          state: survivor.state || "",
          country: survivor.country || "India",
        },
        skills: survivor.skills || [],
        languages: survivor.languages || [],
        summary: survivor.bio || "",
      }));
    }
  }, [survivor]);

  const saveMutation = useMutation({
    mutationFn: (data: ResumeData) => saveResumeBuilderData({ data: { data } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-survivor-profile"] });
      toast.success("Resume saved successfully");
    },
    onError: (err: any) => {
      toast.error("Failed to save resume: " + err.message);
    },
  });

  const handleSave = () => {
    saveMutation.mutate(resumeData);
  };

  const handleAiSuggestSummary = async () => {
    setAiLoading("summary");
    try {
      const { text } = await generateSummaryAi({
        data: {
          skills: resumeData.skills,
          experience: resumeData.experience,
          education: resumeData.education,
        },
      });
      setResumeData((prev) => ({ ...prev, summary: text }));
      toast.success("Summary generated successfully");
    } catch (err: any) {
      toast.error("AI service error: " + err.message);
    } finally {
      setAiLoading(null);
    }
  };

  const handleAiImprove = async (type: "summary" | "experience" | "project" | "skills", index?: number) => {
    setAiLoading(`${type}-${index !== undefined ? index : ""}`);
    try {
      let textToImprove = "";
      if (type === "summary") textToImprove = resumeData.summary;
      else if (type === "experience" && index !== undefined) textToImprove = resumeData.experience[index].description;
      else if (type === "project" && index !== undefined) textToImprove = resumeData.projects[index].description;
      else if (type === "skills") textToImprove = resumeData.skills.join(", ");

      const { text } = await improveTextAi({
        data: { text: textToImprove, type },
      });

      if (type === "summary") {
        setResumeData((prev) => ({ ...prev, summary: text }));
      } else if (type === "experience" && index !== undefined) {
        setResumeData((prev) => {
          const exp = [...prev.experience];
          exp[index].description = text;
          return { ...prev, experience: exp };
        });
      } else if (type === "project" && index !== undefined) {
        setResumeData((prev) => {
          const proj = [...prev.projects];
          proj[index].description = text;
          return { ...prev, projects: proj };
        });
      } else if (type === "skills") {
        const parsedSkills = text.split(",").map((s) => s.trim()).filter(Boolean);
        setResumeData((prev) => ({ ...prev, skills: Array.from(new Set([...prev.skills, ...parsedSkills])) }));
      }
      toast.success("Content improved successfully");
    } catch (err: any) {
      toast.error("AI service error: " + err.message);
    } finally {
      setAiLoading(null);
    }
  };

  const triggerDownloadPDF = () => {
    window.print();
  };

  const renderStep = () => {
    switch (step) {
      case 1: // Personal Info
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
              <User className="size-5" /> Personal Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={resumeData.personalInfo.fullName}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, fullName: e.target.value },
                    }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={resumeData.personalInfo.email}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, email: e.target.value },
                    }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={resumeData.personalInfo.phone}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, phone: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn URL</Label>
                <Input
                  id="linkedin"
                  value={resumeData.personalInfo.linkedin}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, linkedin: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="github">GitHub Profile URL</Label>
                <Input
                  id="github"
                  value={resumeData.personalInfo.github}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, github: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="portfolio">Portfolio URL</Label>
                <Input
                  id="portfolio"
                  value={resumeData.personalInfo.portfolio}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, portfolio: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={resumeData.personalInfo.address}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, address: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={resumeData.personalInfo.city}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, city: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={resumeData.personalInfo.state}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, state: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={resumeData.personalInfo.country}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, country: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={resumeData.personalInfo.pincode}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, pincode: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          </div>
        );

      case 2: // Professional Summary
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
              <FileText className="size-5" /> Professional Summary
            </h3>
            <div className="space-y-2">
              <Label htmlFor="summary">Write a short statement introducing your professional background</Label>
              <Textarea
                id="summary"
                rows={6}
                value={resumeData.summary}
                onChange={(e) => setResumeData((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="E.g., Motivated and skilled Software developer with 2+ years of experience building modern web applications..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="gap-2 text-accent border-accent/20 hover:bg-accent/5"
                onClick={handleAiSuggestSummary}
                disabled={aiLoading === "summary"}
              >
                {aiLoading === "summary" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                Generate Summary (AI)
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => handleAiImprove("summary")}
                disabled={aiLoading === "summary-"}
              >
                {aiLoading === "summary-" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                Improve Summary (AI)
              </Button>
            </div>
          </div>
        );

      case 3: // Education
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
              <GraduationCap className="size-5" /> Education
            </h3>
            {resumeData.education.map((edu, idx) => (
              <div key={idx} className="border border-border rounded-xl p-4 bg-muted/10 relative space-y-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                  onClick={() =>
                    setResumeData((prev) => {
                      const arr = [...prev.education];
                      arr.splice(idx, 1);
                      return { ...prev, education: arr };
                    })
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Degree / Certificate *</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) =>
                        setResumeData((prev) => {
                          const arr = [...prev.education];
                          arr[idx].degree = e.target.value;
                          return { ...prev, education: arr };
                        })
                      }
                      placeholder="E.g., B.Tech / High School"
                      required
                    />
                  </div>
                  <div>
                    <Label>University / School *</Label>
                    <Input
                      value={edu.university}
                      onChange={(e) =>
                        setResumeData((prev) => {
                          const arr = [...prev.education];
                          arr[idx].university = e.target.value;
                          return { ...prev, education: arr };
                        })
                      }
                      placeholder="E.g., Mumbai University"
                      required
                    />
                  </div>
                  <div>
                    <Label>Branch / Field of Study</Label>
                    <Input
                      value={edu.branch}
                      onChange={(e) =>
                        setResumeData((prev) => {
                          const arr = [...prev.education];
                          arr[idx].branch = e.target.value;
                          return { ...prev, education: arr };
                        })
                      }
                      placeholder="E.g., Computer Science"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>CGPA / Grade</Label>
                      <Input
                        value={edu.cgpa}
                        onChange={(e) =>
                          setResumeData((prev) => {
                            const arr = [...prev.education];
                            arr[idx].cgpa = e.target.value;
                            return { ...prev, education: arr };
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Percentage %</Label>
                      <Input
                        value={edu.percentage}
                        onChange={(e) =>
                          setResumeData((prev) => {
                            const arr = [...prev.education];
                            arr[idx].percentage = e.target.value;
                            return { ...prev, education: arr };
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Start Year</Label>
                    <Input
                      value={edu.startYear}
                      onChange={(e) =>
                        setResumeData((prev) => {
                          const arr = [...prev.education];
                          arr[idx].startYear = e.target.value;
                          return { ...prev, education: arr };
                        })
                      }
                      placeholder="E.g., 2020"
                    />
                  </div>
                  <div>
                    <Label>End Year / Expected</Label>
                    <Input
                      value={edu.endYear}
                      onChange={(e) =>
                        setResumeData((prev) => {
                          const arr = [...prev.education];
                          arr[idx].endYear = e.target.value;
                          return { ...prev, education: arr };
                        })
                      }
                      placeholder="E.g., 2024"
                      disabled={edu.current}
                    />
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <input
                      type="checkbox"
                      id={`edu-curr-${idx}`}
                      checked={edu.current}
                      onChange={(e) =>
                        setResumeData((prev) => {
                          const arr = [...prev.education];
                          arr[idx].current = e.target.checked;
                          if (e.target.checked) arr[idx].endYear = "Present";
                          return { ...prev, education: arr };
                        })
                      }
                    />
                    <Label htmlFor={`edu-curr-${idx}`}>Currently studying here</Label>
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-dashed"
              onClick={() =>
                setResumeData((prev) => ({
                  ...prev,
                  education: [
                    ...prev.education,
                    {
                      degree: "",
                      university: "",
                      branch: "",
                      cgpa: "",
                      percentage: "",
                      startYear: "",
                      endYear: "",
                      current: false,
                    },
                  ],
                }))
              }
            >
              <Plus className="size-4" /> Add Education Entry
            </Button>
          </div>
        );

      case 4: // Experience
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
              <Briefcase className="size-5" /> Experience
            </h3>
            {resumeData.experience.map((exp, idx) => (
              <div key={idx} className="border border-border rounded-xl p-4 bg-muted/10 relative space-y-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                  onClick={() =>
                    setResumeData((prev) => {
                      const arr = [...prev.experience];
                      arr.splice(idx, 1);
                      return { ...prev, experience: arr };
                    })
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Company Name *</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) =>
                        setResumeData((prev) => {
                          const arr = [...prev.experience];
                          arr[idx].company = e.target.value;
                          return { ...prev, experience: arr };
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Position *</Label>
                    <Input
                      value={exp.position}
                      onChange={(e) =>
                        setResumeData((prev) => {
                          const arr = [...prev.experience];
                          arr[idx].position = e.target.value;
                          return { ...prev, experience: arr };
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      value={exp.start}
                      onChange={(e) =>
                        setResumeData((prev) => {
                          const arr = [...prev.experience];
                          arr[idx].start = e.target.value;
                          return { ...prev, experience: arr };
                        })
                      }
                      placeholder="E.g., June 2022"
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      value={exp.end}
                      onChange={(e) =>
                        setResumeData((prev) => {
                          const arr = [...prev.experience];
                          arr[idx].end = e.target.value;
                          return { ...prev, experience: arr };
                        })
                      }
                      placeholder="E.g., Dec 2023"
                      disabled={exp.current}
                    />
                  </div>
                  <div className="flex items-center gap-6 sm:col-span-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`exp-curr-${idx}`}
                        checked={exp.current}
                        onChange={(e) =>
                          setResumeData((prev) => {
                            const arr = [...prev.experience];
                            arr[idx].current = e.target.checked;
                            if (e.target.checked) arr[idx].end = "Present";
                            return { ...prev, experience: arr };
                          })
                        }
                      />
                      <Label htmlFor={`exp-curr-${idx}`}>Current Position</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`exp-intern-${idx}`}
                        checked={exp.internship}
                        onChange={(e) =>
                          setResumeData((prev) => {
                            const arr = [...prev.experience];
                            arr[idx].internship = e.target.checked;
                            return { ...prev, experience: arr };
                          })
                        }
                      />
                      <Label htmlFor={`exp-intern-${idx}`}>This is an Internship</Label>
                    </div>
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label>Description / Roles & Accomplishments</Label>
                    <Textarea
                      rows={4}
                      value={exp.description}
                      onChange={(e) =>
                        setResumeData((prev) => {
                          const arr = [...prev.experience];
                          arr[idx].description = e.target.value;
                          return { ...prev, experience: arr };
                        })
                      }
                      placeholder="Describe what you built, worked on, or managed. Use action-verbs."
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleAiImprove("experience", idx)}
                      disabled={aiLoading === `experience-${idx}`}
                    >
                      {aiLoading === `experience-${idx}` ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="size-3.5" />
                      )}
                      Improve Description (AI)
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-dashed"
              onClick={() =>
                setResumeData((prev) => ({
                  ...prev,
                  experience: [
                    ...prev.experience,
                    {
                      company: "",
                      position: "",
                      internship: false,
                      description: "",
                      start: "",
                      end: "",
                      current: false,
                    },
                  ],
                }))
              }
            >
              <Plus className="size-4" /> Add Experience Entry
            </Button>
          </div>
        );

      case 5: // Projects
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
              <FolderGit2 className="size-5" /> Projects
            </h3>
            {resumeData.projects.map((proj, idx) => (
              <div key={idx} className="border border-border rounded-xl p-4 bg-muted/10 relative space-y-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                  onClick={() =>
                    setResumeData((prev) => {
                      const arr = [...prev.projects];
                      arr.splice(idx, 1);
                      return { ...prev, projects: arr };
                    })
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Project Title *</Label>
                    <Input
                      value={proj.title}
                      onChange={(e) =>
                        setResumeData((prev) => {
                          const arr = [...prev.projects];
                          arr[idx].title = e.target.value;
                          return { ...prev, projects: arr };
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Technologies Used</Label>
                    <Input
                      value={proj.technologies}
                      onChange={(e) =>
                        setResumeData((prev) => {
                          const arr = [...prev.projects];
                          arr[idx].technologies = e.target.value;
                          return { ...prev, projects: arr };
                        })
                      }
                      placeholder="E.g., React, Node.js, CSS"
                    />
                  </div>
                  <div>
                    <Label>GitHub URL</Label>
                    <Input
                      value={proj.github}
                      onChange={(e) =>
                        setResumeData((prev) => {
                          const arr = [...prev.projects];
                          arr[idx].github = e.target.value;
                          return { ...prev, projects: arr };
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Live Demo Link</Label>
                    <Input
                      value={proj.liveLink}
                      onChange={(e) =>
                        setResumeData((prev) => {
                          const arr = [...prev.projects];
                          arr[idx].liveLink = e.target.value;
                          return { ...prev, projects: arr };
                        })
                      }
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      rows={3}
                      value={proj.description}
                      onChange={(e) =>
                        setResumeData((prev) => {
                          const arr = [...prev.projects];
                          arr[idx].description = e.target.value;
                          return { ...prev, projects: arr };
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleAiImprove("project", idx)}
                      disabled={aiLoading === `project-${idx}`}
                    >
                      {aiLoading === `project-${idx}` ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="size-3.5" />
                      )}
                      Improve Project (AI)
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-dashed"
              onClick={() =>
                setResumeData((prev) => ({
                  ...prev,
                  projects: [
                    ...prev.projects,
                    {
                      title: "",
                      description: "",
                      technologies: "",
                      github: "",
                      liveLink: "",
                    },
                  ],
                }))
              }
            >
              <Plus className="size-4" /> Add Project Entry
            </Button>
          </div>
        );

      case 6: // Skills
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
              <Wrench className="size-5" /> Skills Tags
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Add Custom Skill (comma separated)</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="skillInput"
                    placeholder="E.g., Angular, Kubernetes, Spanish"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val) {
                          const list = val.split(",").map((s) => s.trim()).filter(Boolean);
                          setResumeData((prev) => ({
                            ...prev,
                            skills: Array.from(new Set([...prev.skills, ...list])),
                          }));
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const inputEl = document.getElementById("skillInput") as HTMLInputElement;
                      const val = inputEl?.value.trim();
                      if (val) {
                        const list = val.split(",").map((s) => s.trim()).filter(Boolean);
                        setResumeData((prev) => ({
                          ...prev,
                          skills: Array.from(new Set([...prev.skills, ...list])),
                        }));
                        inputEl.value = "";
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <Label>Selected Skills ({resumeData.skills.length})</Label>
                <div className="flex flex-wrap gap-2 mt-2 border border-border p-4 rounded-xl min-h-16 bg-muted/5">
                  {resumeData.skills.length === 0 ? (
                    <span className="text-sm text-muted-foreground">No skills added yet. Click presets or add custom ones.</span>
                  ) : (
                    resumeData.skills.map((s, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1 pr-1.5 py-1 text-sm bg-accent/10 border-accent/20">
                        {s}
                        <button
                          type="button"
                          className="hover:text-destructive transition-colors shrink-0 text-muted-foreground"
                          onClick={() =>
                            setResumeData((prev) => ({
                              ...prev,
                              skills: prev.skills.filter((item) => item !== s),
                            }))
                          }
                        >
                          &times;
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => handleAiImprove("skills")}
                  disabled={aiLoading === "skills-"}
                >
                  {aiLoading === "skills-" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  Suggest Smart Skills (AI)
                </Button>
              </div>

              <div>
                <Label>Presets (Click to Add)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {PRESET_SKILLS.map((p, idx) => {
                    const isAdded = resumeData.skills.includes(p);
                    return (
                      <Badge
                        key={idx}
                        variant={isAdded ? "default" : "outline"}
                        className={`cursor-pointer transition-all ${isAdded ? "bg-primary opacity-60 pointer-events-none" : "hover:bg-accent/10 hover:border-accent"}`}
                        onClick={() => {
                          if (!isAdded) {
                            setResumeData((prev) => ({ ...prev, skills: [...prev.skills, p] }));
                          }
                        }}
                      >
                        {p}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case 7: // Certifications
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
              <Award className="size-5" /> Certifications
            </h3>
            {resumeData.certifications.map((cert, idx) => (
              <div key={idx} className="border border-border rounded-xl p-4 bg-muted/10 relative space-y-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 text-destructive hover:bg-destructive/10"
                  onClick={() =>
                    setResumeData((prev) => {
                      const arr = [...prev.certifications];
                      arr.splice(idx, 1);
                      return { ...prev, certifications: arr };
                    })
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Certification Name *</Label>
                    <Input
                      value={cert.name}
                      onChange={(e) =>
                        setResumeData((prev) => {
                          const arr = [...prev.certifications];
                          arr[idx].name = e.target.value;
                          return { ...prev, certifications: arr };
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Issuing Organization *</Label>
                    <Input
                      value={cert.organization}
                      onChange={(e) =>
                        setResumeData((prev) => {
                          const arr = [...prev.certifications];
                          arr[idx].organization = e.target.value;
                          return { ...prev, certifications: arr };
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Date / Year</Label>
                    <Input
                      value={cert.date}
                      onChange={(e) =>
                        setResumeData((prev) => {
                          const arr = [...prev.certifications];
                          arr[idx].date = e.target.value;
                          return { ...prev, certifications: arr };
                        })
                      }
                      placeholder="E.g., 2023"
                    />
                  </div>
                  <div>
                    <Label>Credential URL</Label>
                    <Input
                      value={cert.credentialUrl}
                      onChange={(e) =>
                        setResumeData((prev) => {
                          const arr = [...prev.certifications];
                          arr[idx].credentialUrl = e.target.value;
                          return { ...prev, certifications: arr };
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-dashed"
              onClick={() =>
                setResumeData((prev) => ({
                  ...prev,
                  certifications: [
                    ...prev.certifications,
                    { name: "", organization: "", date: "", credentialUrl: "" },
                  ],
                }))
              }
            >
              <Plus className="size-4" /> Add Certification Entry
            </Button>
          </div>
        );

      case 8: // Achievements
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
              <Award className="size-5" /> Achievements
            </h3>
            {resumeData.achievements.map((ach, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  value={ach}
                  onChange={(e) =>
                    setResumeData((prev) => {
                      const arr = [...prev.achievements];
                      arr[idx] = e.target.value;
                      return { ...prev, achievements: arr };
                    })
                  }
                  placeholder="E.g., Won 1st place in Inter-College Codeathon 2023"
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 shrink-0"
                  onClick={() =>
                    setResumeData((prev) => ({
                      ...prev,
                      achievements: prev.achievements.filter((_, i) => i !== idx),
                    }))
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-dashed"
              onClick={() =>
                setResumeData((prev) => ({
                  ...prev,
                  achievements: [...prev.achievements, ""],
                }))
              }
            >
              <Plus className="size-4" /> Add Achievement
            </Button>
          </div>
        );

      case 9: // Languages
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
              <Globe className="size-5" /> Languages
            </h3>
            {resumeData.languages.map((lang, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input
                  value={lang}
                  onChange={(e) =>
                    setResumeData((prev) => {
                      const arr = [...prev.languages];
                      arr[idx] = e.target.value;
                      return { ...prev, languages: arr };
                    })
                  }
                  placeholder="E.g., English / Hindi"
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 shrink-0"
                  onClick={() =>
                    setResumeData((prev) => ({
                      ...prev,
                      languages: prev.languages.filter((_, i) => i !== idx),
                    }))
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-dashed"
              onClick={() =>
                setResumeData((prev) => ({
                  ...prev,
                  languages: [...prev.languages, ""],
                }))
              }
            >
              <Plus className="size-4" /> Add Language
            </Button>
          </div>
        );

      case 10: // Additional Optional Sections
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
              <PlusCircle className="size-5" /> Additional Sections (Optional)
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Volunteer Work</Label>
                <Textarea
                  rows={2}
                  value={resumeData.additional.volunteerWork}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      additional: { ...prev.additional, volunteerWork: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label>Research & Publications</Label>
                <Textarea
                  rows={2}
                  value={resumeData.additional.research}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      additional: { ...prev.additional, research: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label>Hackathons</Label>
                <Textarea
                  rows={2}
                  value={resumeData.additional.hackathons}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      additional: { ...prev.additional, hackathons: e.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label>Interests & Hobbies</Label>
                <Textarea
                  rows={2}
                  value={resumeData.additional.interests}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      additional: { ...prev.additional, interests: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Professional References</Label>
                <Textarea
                  rows={2}
                  value={resumeData.additional.references}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      additional: { ...prev.additional, references: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PortalShell title="AI Mentor" nav={MENTOR_NAV} allow={["survivor", "ngo_partner", "admin", "super_admin"]}>
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr] print:block">
        
        {/* Form Column */}
        <div className="space-y-6 print:hidden">
          <div>
            <h1 className="font-display text-3xl font-bold text-primary">Resume Builder</h1>
            <p className="mt-2 text-sm text-muted-foreground">Create a professionally formatted resume directly in CAREVIA.</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>Step {step} of 10</span>
              <span>{Math.round((step / 10) * 100)}% Complete</span>
            </div>
            <Progress value={(step / 10) * 100} className="h-2" />
          </div>

          <Card className="border-border">
            <CardContent className="p-6">
              {renderStep()}

              <div className="flex justify-between items-center mt-8 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  disabled={step === 1}
                >
                  Back
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="gap-1.5" onClick={handleSave} disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                    Save Progress
                  </Button>
                  {step < 10 ? (
                    <Button type="button" onClick={() => setStep((s) => Math.min(10, s + 1))}>
                      Next Step
                    </Button>
                  ) : (
                    <Button type="button" variant="accent" className="gap-1.5" onClick={triggerDownloadPDF}>
                      <Download className="size-4" /> Download PDF
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Column */}
        <div className="space-y-4 print:w-full print:p-0">
          <div className="flex items-center justify-between print:hidden">
            <h2 className="text-xl font-bold text-primary">Live Preview</h2>
            <div className="flex gap-1.5">
              {(["professional", "modern", "minimal", "ats"] as const).map((t) => (
                <Button
                  key={t}
                  variant={selectedTemplate === t ? "default" : "outline"}
                  size="sm"
                  className="capitalize text-xs px-2.5 py-1"
                  onClick={() => setSelectedTemplate(t)}
                >
                  {t === "ats" ? "ATS" : t}
                </Button>
              ))}
            </div>
          </div>

          <div
            id="resume-print-container"
            className={`border border-border bg-card p-8 rounded-2xl shadow-sm text-foreground print:border-none print:shadow-none print:p-0 min-h-[842px] font-sans ${selectedTemplate}`}
          >
            {/* Styles specific to selected template */}
            <style>{`
              .professional {
                font-family: 'Times New Roman', Georgia, serif;
                font-size: 13.5px;
                line-height: 1.5;
              }
              .professional h1 {
                font-family: 'Times New Roman', Georgia, serif;
                font-size: 24px;
                text-align: center;
                font-weight: bold;
                border-bottom: 2px solid var(--border);
                padding-bottom: 6px;
                margin-bottom: 8px;
              }
              .professional h2 {
                font-family: 'Times New Roman', Georgia, serif;
                font-size: 14px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border-bottom: 1px solid var(--border);
                margin-top: 14px;
                margin-bottom: 6px;
                padding-bottom: 2px;
              }
              
              .modern {
                font-family: 'Inter', sans-serif;
                font-size: 13px;
                line-height: 1.45;
                display: grid;
                grid-template-columns: 1fr 2fr;
                gap: 20px;
              }
              .modern .header {
                grid-column: span 2;
                border-bottom: 3px solid var(--primary);
                padding-bottom: 8px;
              }
              .modern h1 {
                font-size: 26px;
                font-weight: 800;
                color: var(--primary);
              }
              .modern h2 {
                font-size: 13px;
                font-weight: 700;
                color: var(--primary);
                border-bottom: 1.5px solid var(--primary);
                margin-top: 14px;
                margin-bottom: 6px;
                padding-bottom: 2px;
                text-transform: uppercase;
              }

              .minimal {
                font-family: 'Inter', sans-serif;
                font-size: 13px;
                line-height: 1.5;
              }
              .minimal h1 {
                font-size: 22px;
                font-weight: 500;
                letter-spacing: -0.5px;
                margin-bottom: 4px;
              }
              .minimal h2 {
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: var(--muted-foreground);
                margin-top: 16px;
                margin-bottom: 6px;
              }

              .ats {
                font-family: Arial, Helvetica, sans-serif;
                font-size: 12px;
                line-height: 1.4;
                color: #000;
              }
              .ats h1 {
                font-size: 20px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 4px;
              }
              .ats h2 {
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
                border-bottom: 1px solid #000;
                margin-top: 12px;
                margin-bottom: 4px;
              }

              @media print {
                body * {
                  visibility: hidden;
                }
                #resume-print-container, #resume-print-container * {
                  visibility: visible;
                }
                #resume-print-container {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  border: none !important;
                  box-shadow: none !important;
                  background: white !important;
                  color: black !important;
                }
              }
            `}</style>

            {selectedTemplate === "modern" ? (
              // MODERN 2-COLUMN TEMPLATE
              <>
                <div className="header">
                  <h1>{resumeData.personalInfo.fullName || "Your Full Name"}</h1>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                    {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
                    {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
                    {resumeData.personalInfo.city && <span>{resumeData.personalInfo.city}, {resumeData.personalInfo.state}</span>}
                  </div>
                </div>
                
                {/* Left Side Column */}
                <div className="space-y-4 border-r border-border pr-4">
                  <div>
                    <h2>Contact</h2>
                    <div className="text-xs space-y-1 mt-1 text-muted-foreground">
                      {resumeData.personalInfo.linkedin && <p className="truncate">LinkedIn: {resumeData.personalInfo.linkedin}</p>}
                      {resumeData.personalInfo.github && <p className="truncate">GitHub: {resumeData.personalInfo.github}</p>}
                      {resumeData.personalInfo.portfolio && <p className="truncate">Portfolio: {resumeData.personalInfo.portfolio}</p>}
                      {resumeData.personalInfo.address && <p>{resumeData.personalInfo.address}</p>}
                    </div>
                  </div>

                  {resumeData.skills.length > 0 && (
                    <div>
                      <h2>Skills</h2>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {resumeData.skills.map((s, i) => (
                          <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {resumeData.languages.filter(Boolean).length > 0 && (
                    <div>
                      <h2>Languages</h2>
                      <p className="text-xs text-muted-foreground mt-1">{resumeData.languages.filter(Boolean).join(", ")}</p>
                    </div>
                  )}

                  {resumeData.achievements.filter(Boolean).length > 0 && (
                    <div>
                      <h2>Achievements</h2>
                      <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1 mt-1">
                        {resumeData.achievements.filter(Boolean).map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Right Side Column */}
                <div className="space-y-4">
                  {resumeData.summary && (
                    <div>
                      <h2>Profile</h2>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1">{resumeData.summary}</p>
                    </div>
                  )}

                  {resumeData.experience.length > 0 && (
                    <div>
                      <h2>Experience</h2>
                      <div className="space-y-3 mt-1">
                        {resumeData.experience.map((exp, i) => (
                          <div key={i} className="text-xs">
                            <div className="flex justify-between font-bold">
                              <span>{exp.position}</span>
                              <span className="text-muted-foreground">{exp.start} - {exp.end}</span>
                            </div>
                            <div className="font-semibold text-primary">{exp.company} {exp.internship && "(Internship)"}</div>
                            <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {resumeData.projects.length > 0 && (
                    <div>
                      <h2>Projects</h2>
                      <div className="space-y-3 mt-1">
                        {resumeData.projects.map((proj, i) => (
                          <div key={i} className="text-xs">
                            <div className="flex justify-between font-bold">
                              <span>{proj.title}</span>
                              {proj.liveLink && <span className="text-accent underline">Demo</span>}
                            </div>
                            {proj.technologies && <div className="text-[11px] text-muted-foreground">Tech: {proj.technologies}</div>}
                            <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {resumeData.education.length > 0 && (
                    <div>
                      <h2>Education</h2>
                      <div className="space-y-2 mt-1">
                        {resumeData.education.map((edu, i) => (
                          <div key={i} className="text-xs">
                            <div className="flex justify-between font-bold">
                              <span>{edu.degree} {edu.branch && `in ${edu.branch}`}</span>
                              <span className="text-muted-foreground">{edu.startYear} - {edu.endYear}</span>
                            </div>
                            <div>{edu.university}</div>
                            {edu.cgpa && <div className="text-muted-foreground text-[11px]">CGPA: {edu.cgpa}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // GENERAL SINGLE COLUMN TEMPLATE (PROFESSIONAL, MINIMAL, ATS)
              <div className="space-y-4">
                <div className={`${selectedTemplate === "professional" || selectedTemplate === "ats" ? "text-center" : ""}`}>
                  <h1 className="font-bold tracking-tight">{resumeData.personalInfo.fullName || "Your Full Name"}</h1>
                  <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
                    {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
                    {resumeData.personalInfo.city && <span>{resumeData.personalInfo.city}, {resumeData.personalInfo.state}</span>}
                    {resumeData.personalInfo.linkedin && <span className="underline">LinkedIn</span>}
                    {resumeData.personalInfo.github && <span className="underline">GitHub</span>}
                  </div>
                </div>

                {resumeData.summary && (
                  <div>
                    <h2>Professional Summary</h2>
                    <p className="whitespace-pre-wrap">{resumeData.summary}</p>
                  </div>
                )}

                {resumeData.experience.length > 0 && (
                  <div>
                    <h2>Experience</h2>
                    <div className="space-y-3">
                      {resumeData.experience.map((exp, i) => (
                        <div key={i} className="space-y-0.5">
                          <div className="flex justify-between font-semibold">
                            <span>{exp.position} — {exp.company} {exp.internship && "(Internship)"}</span>
                            <span className="text-muted-foreground text-xs">{exp.start} - {exp.end}</span>
                          </div>
                          <p className="text-xs text-muted-foreground whitespace-pre-wrap mt-1">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {resumeData.projects.length > 0 && (
                  <div>
                    <h2>Projects</h2>
                    <div className="space-y-3">
                      {resumeData.projects.map((proj, i) => (
                        <div key={i} className="space-y-0.5">
                          <div className="flex justify-between font-semibold">
                            <span>{proj.title} {proj.technologies && `(${proj.technologies})`}</span>
                            <div className="flex gap-2 text-xs">
                              {proj.github && <span className="underline">Code</span>}
                              {proj.liveLink && <span className="underline">Live</span>}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground whitespace-pre-wrap mt-1">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {resumeData.skills.length > 0 && (
                  <div>
                    <h2>Skills</h2>
                    <p className="text-xs">{resumeData.skills.join(", ")}</p>
                  </div>
                )}

                {resumeData.education.length > 0 && (
                  <div>
                    <h2>Education</h2>
                    <div className="space-y-2">
                      {resumeData.education.map((edu, i) => (
                        <div key={i} className="space-y-0.5">
                          <div className="flex justify-between font-semibold">
                            <span>{edu.degree} {edu.branch && `in ${edu.branch}`} — {edu.university}</span>
                            <span className="text-muted-foreground text-xs">{edu.startYear} - {edu.endYear}</span>
                          </div>
                          {edu.cgpa && <div className="text-[11px] text-muted-foreground">Grade/CGPA: {edu.cgpa}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {resumeData.certifications.length > 0 && (
                  <div>
                    <h2>Certifications</h2>
                    <div className="space-y-1 text-xs">
                      {resumeData.certifications.map((cert, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{cert.name} — {cert.organization}</span>
                          <span className="text-muted-foreground">{cert.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {resumeData.achievements.filter(Boolean).length > 0 && (
                  <div>
                    <h2>Achievements</h2>
                    <ul className="list-disc pl-4 text-xs space-y-0.5">
                      {resumeData.achievements.filter(Boolean).map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {resumeData.languages.filter(Boolean).length > 0 && (
                  <div>
                    <h2>Languages</h2>
                    <p className="text-xs">{resumeData.languages.filter(Boolean).join(", ")}</p>
                  </div>
                )}

                {(resumeData.additional.volunteerWork || resumeData.additional.research || resumeData.additional.interests) && (
                  <div>
                    <h2>Additional Details</h2>
                    <div className="text-xs space-y-1.5">
                      {resumeData.additional.volunteerWork && <p><strong>Volunteer Work:</strong> {resumeData.additional.volunteerWork}</p>}
                      {resumeData.additional.research && <p><strong>Research & Publications:</strong> {resumeData.additional.research}</p>}
                      {resumeData.additional.interests && <p><strong>Interests:</strong> {resumeData.additional.interests}</p>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </PortalShell>
  );
}
